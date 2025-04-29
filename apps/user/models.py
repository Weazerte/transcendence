from django.contrib.auth.models import AbstractUser
from django.db import models

class UserStatus(models.TextChoices):
    ONLINE = 'online', 'Online'
    OFFLINE = 'offline', 'Offline'

class User(AbstractUser):
    """Custom user model extending Django's built-in User"""
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    nickname = models.CharField(max_length=50, unique=True)
    bio = models.CharField(max_length=255, null=True, blank=True)
    two_factor_enabled = models.BooleanField(default=False)
    coalition = models.CharField(max_length=50, null=True, blank=True)
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    friends = models.ManyToManyField("self", related_name='user_friends', symmetrical=False)
    status = models.CharField(
        max_length=20,
        choices=UserStatus.choices,
        default=UserStatus.OFFLINE
    )

    def __str__(self):
        return self.nickname or self.username

    def get_friends(self):
        """Get all friends for the user"""
        return self.friends.all()

    def get_nick(self):
        return self.nickname

    def get_games(self):
        """Get all games for the user"""
        return (self.games_as_player1.all() |
                self.games_as_player2.all()).distinct()

    def get_stats(self):
        """Get user's game statistics"""
        total_games = self.wins + self.losses
        win_rate = (self.wins / total_games * 100) if total_games > 0 else 0

        return {
            'wins': self.wins,
            'losses': self.losses,
            'total_games': total_games,
            'win_rate': win_rate
        }