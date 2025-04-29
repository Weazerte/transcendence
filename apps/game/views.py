from rest_framework import viewsets
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import action
from apps.game.models import Game, GameStatus
from rest_framework.permissions import IsAuthenticated
from apps.user.models import User
from rest_framework import permissions
from .serializers import GameSerializer


class gameViewset(viewsets.ModelViewSet):
    queryset = Game.objects.all()
    serializer_class = GameSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request):
        """Handle POST /api/game/"""
        game = Game.objects.create(
            player1= request.user,
            player2=None,
            winner=None,
            player1_score=0,
            player2_score=0,
        )

        return Response({
            'game_id': game.id,
            'status': 'created',
            'player1': request.user.nickname
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def join(self, request):
        """Handle POST /api/game/join/"""

        # Get the game ID from the request data
        game_id = request.data.get('gameId')

        if not game_id:
            return Response({
                'error': 'Game ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)


        # Find the game
        try:
            game = Game.objects.get(id=game_id)

            if game.game_status != GameStatus.WAITING:
                return Response({
                    'error': 'Game is in progress or already completed'
                }, status=status.HTTP_400_BAD_REQUEST)

        except Game.DoesNotExist:
            return Response({
                'error': 'Game not found'
            }, status=status.HTTP_404_NOT_FOUND)

        # Update the game with player 2
        game.player2 = request.user
        game.save()

        return Response({
            'game_id': game.id,
            'status': 'joined',
            'player1': game.player1.nickname,
            'player2': game.player2.nickname,
        }, status=status.HTTP_200_OK)
