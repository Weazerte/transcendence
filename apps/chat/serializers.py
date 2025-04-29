from rest_framework import serializers
from .models import DirectMessage
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

class DirectMessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)
    receiver_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = DirectMessage
        fields = ['id', 'sender', 'receiver', 'receiver_id', 'content', 'timestamp', 'embeds']
        read_only_fields = ['id', 'timestamp'] 