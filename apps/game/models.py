from django.db import models
from apps.user.models import User

class GameStatus(models.TextChoices):
    WAITING = 'waiting'
    PLAYING = 'playing'
    COMPLETED = 'completed'

class Game(models.Model):
    """Records games between users"""
    player1 = models.ForeignKey(User, related_name='games_as_player1', on_delete=models.CASCADE)
    player2 = models.ForeignKey(User, related_name='games_as_player2', on_delete=models.CASCADE, blank=True ,null=True)
    winner = models.ForeignKey(User, related_name='games_won', on_delete=models.CASCADE, blank=True, null=True)
    played_at = models.DateTimeField(auto_now_add=True)
    player1_score = models.IntegerField()
    player2_score = models.IntegerField()
    player_rdy = models.IntegerField(default=0)
    settings = models.JSONField(null=True, blank=True)
    game_status = models.CharField(
        max_length=20,
        choices=GameStatus.choices,
        default=GameStatus.WAITING
    )

    def getP1Score(self):
        return self.player1_score
    
    def getP2Score(self):
        return self.player2_score


    def addPlayerRdy(self):
        self.player_rdy += 1
        self.save()
        return self.player_rdy == 2
    
    def incrementWinner(self):
        self.winner.wins = self.winner.wins + 1
        self.winner.save()

        loser = self.player1 if self.winner == self.player2 else self.player2
        loser.losses = loser.losses + 1
        loser.save()
