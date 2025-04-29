from rest_framework import serializers
from .models import User
import os

class UserReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id',
            'nickname',
            'avatar',
            'coalition',
            'wins',
            'losses',
            'status',
            'bio',
        )

class UserUpdateSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(required=False)
    nickname = serializers.CharField(max_length=50, required=False)
    bio = serializers.CharField(max_length=255, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = (
            'id',
            'nickname',
            'avatar',
            'coalition',
            'wins',
            'losses',
            'status',
            'bio',
        )
        read_only_fields = ('id', 'coalition', 'wins', 'losses', 'status')

    def validate_nickname(self, value):
        """Validate nickname format and uniqueness"""
        if not value:
            return value
            
        # Check if nickname contains only allowed characters
        if not value.replace(' ', '').isalnum():
            raise serializers.ValidationError("Nickname can only contain letters, numbers, and spaces")
            
        # Check if nickname is already taken by another user
        if User.objects.filter(nickname=value).exclude(id=self.instance.id).exists():
            raise serializers.ValidationError("This nickname is already taken")
            
        return value

    def validate_avatar(self, value):
        """Validate avatar file"""
        if not value:
            return value
            
        # Check file size (max 2MB)
        if value.size > 2 * 1024 * 1024:
            raise serializers.ValidationError("Avatar file size must be less than 2MB")
            
        # Check file extension
        valid_extensions = ['.jpg', '.jpeg', '.png', '.gif']
        ext = os.path.splitext(value.name)[1].lower()
        if ext not in valid_extensions:
            raise serializers.ValidationError("Avatar must be a valid image file (jpg, jpeg, png, gif)")
            
        return value

    def validate_bio(self, value):
        """Validate bio length and content"""
        if not value:
            return value
            
        # Check for potentially harmful content
        if any(char in value for char in ['<', '>', '&', '"', "'"]):
            raise serializers.ValidationError("Bio contains invalid characters")
            
        return value
