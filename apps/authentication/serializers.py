from rest_framework import serializers

class AuthSerializer(serializers.Serializer):
    access_token = serializers.CharField()
    refresh_token = serializers.CharField()