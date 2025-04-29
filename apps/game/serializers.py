from .models import Game
from rest_framework import serializers

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ['player1', 'player2', 'winner', 'played_at', 'player1_score', 'player2_score', 'id']
