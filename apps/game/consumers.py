import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async, sync_to_async
from apps.game.models import Game, GameStatus
from django.utils import timezone

logger = logging.getLogger(__name__)


class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.game_group_name = f'game_{self.game_id}'

        await self.accept()

        try:
            self.game = await sync_to_async(Game.objects.get)(id=self.game_id)

            if self.game.game_status != GameStatus.WAITING:
                logger.error(f"Error: Game {self.game_id} is not waiting for a player")
                self.close(code=1008, reason="Game is in progress or already completed")
                return

        except Game.DoesNotExist:
            logger.error(f"Error: Game {self.game_id} not found")
            self.close(code=1008, reason="Game not found")
            return

        await self.channel_layer.group_add(
            self.game_group_name,
            self.channel_name
        )

        logger.info(f"WebSocket connected for game: {self.game_id}")

    async def disconnect(self, close_code):
        players_count = await self.get_players_count()

        if players_count == 1:
            await self.delete_game()

            await self.channel_layer.group_discard(
                self.game_group_name,
                self.channel_name
            )

            logger.info(f"Game {self.game_id} deleted because no players")

        logger.info(f"WebSocket disconnected for game: {self.game_id}, code: {close_code}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            logger.info(f"Received message: {data}")
            
            message_type = data.get('type', '')
            
            if message_type == 'player_joined':
                await self.channel_layer.group_send(
                    self.game_group_name,
                    {
                        'type': 'player_joined',
                        'player': data.get('player', ''),
                        'game_id': data.get('game_id', '')
                    }
                )
            
            elif message_type == 'game-settings':
                await self.channel_layer.group_send(
                    self.game_group_name,
                    {
                        'type': 'game_settings',
                        'settings': data.get('settings', {}),
                        'game_id': data.get('game_id', '')
                    }
                )

            elif message_type == 'ready':
                game_id = data.get('game_id', '')
                game_info = await self.get_game_info(game_id)
                both_ready = await self.mark_player_ready(game_id)

                if both_ready:
                    await self.channel_layer.group_send(
                        self.game_group_name,
                        {
                            'type': 'game_start',
                            'game_id': game_id,
                            'player_left_nickname': game_info['player_left_nickname'],
                            'player_right_nickname': game_info['player_right_nickname']
                        }
                    )

            elif message_type == 'player_move':
                await self.channel_layer.group_send(
                    self.game_group_name,
                    {
                        'type': 'player_move',
                        'player': data.get('player', ''),
                        'direction': data.get('direction', '')
                    }
                )

            elif message_type == 'hit_ball':
                await self.channel_layer.group_send(
                    self.game_group_name,
                    {
                        'type': 'hit_ball',
                        'hit_position': data.get('hit_position', ''),
                        'direction': data.get('direction', ''),
                        'paddle_position': data.get('paddle_position', ''),
                        'player': data.get('player', '')
                    }
                )

            elif message_type == 'winner':
                game_id = data.get('game_id', '')
                winner_player = data.get('winner', '')
                scores = data.get('scores', {})

                await self.set_game_winner(game_id, winner_player, scores)

        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))
        except Exception as e:
            logger.error(f"Error processing message: {str(e)}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': str(e)
            }))

    @database_sync_to_async
    def mark_player_ready(self, game_id):
        """Mark a player as ready and return True if both players are ready"""
        try:
            game = Game.objects.get(id=game_id)
            return game.addPlayerRdy()
        except Game.DoesNotExist:
            return False
    
    @database_sync_to_async
    def set_game_status(self, game_id, status):
        game = Game.objects.get(id=game_id)
        game.game_status = status
        game.save()

    @database_sync_to_async
    def delete_game(self):
        Game.objects.filter(id=self.game_id).delete()
    
    @database_sync_to_async
    def get_players_count(self):
        try:
            game = Game.objects.get(id=self.game_id)
            player_count = 0
            
            if game.player1 is not None:
                player_count += 1
            
            if game.player2 is not None:
                player_count += 1
                
            return player_count
        except Game.DoesNotExist:
            logger.error(f"Error: Game {self.game_id} not found when counting players")
            return 0


    async def game_settings(self, event):
        await self.send(text_data=json.dumps({
            'type': 'game-settings',
            'settings': event['settings'],
            'game_id': event['game_id']
        }))

    async def player_joined(self, event):
        await self.send(text_data=json.dumps({
            'type': 'player_joined',
            'player': event['player'],
            'game_id': event['game_id']
        }))

    async def game_start(self, event):
        try:
            await self.send(text_data=json.dumps({
                'type': 'game_start',
                'game_id': event['game_id'],
                'player_left_nickname': event['player_left_nickname'],
                'player_right_nickname': event['player_right_nickname']
            }))

            logger.info(f"Sent game_start message for game: {event['game_id']}")

            await self.set_game_status(event['game_id'], GameStatus.PLAYING)
        except Exception as e:
            logger.error(f"Error sending game_start: {str(e)}")

    async def player_move(self, event):
        await self.send(text_data=json.dumps({
            'type': 'player_move',
            'player': event['player'],
            'direction': event['direction']
        }))

    async def hit_ball(self, event):
        await self.send(text_data=json.dumps({
            'type': 'hit_ball',
            'hit_position': event['hit_position'],
            'direction': event['direction'],
            'paddle_position': event['paddle_position'],
            'player': event['player']
        }))

    @database_sync_to_async
    def get_game_info(self, game_id):
        """Get game information including player nicknames"""
        try:
            game = Game.objects.get(id=game_id)
            return {
                'player_left_nickname': game.player1.username if game.player1 else 'Player 1',
                'player_right_nickname': game.player2.username if game.player2 else 'Player 2'
            }
        except Game.DoesNotExist:
            return {
                'player_left_nickname': 'Player 1',
                'player_right_nickname': 'Player 2'
            }

    @database_sync_to_async
    def set_game_winner(self, game_id, winner_player, scores):
        try:
            game = Game.objects.get(id=game_id)

            if winner_player == 'left':
                winner_user = game.player1
            else:
                winner_user = game.player2
            
            game.winner = winner_user
            game.player1_score = scores.get('left', 0)
            game.player2_score = scores.get('right', 0)

            game.completed_at = timezone.now()
            game.game_status = GameStatus.COMPLETED
            game.save()
            game.incrementWinner()
            logger.info(f"Game {game_id} completed: Winner: {winner_user.nickname} with scores {scores}")

        except Game.DoesNotExist:
            logger.error(f"Error: Game {game_id} not found")
            return False
        except Exception as e:
            logger.error(f"Error saving game winner: {str(e)}")
            return False