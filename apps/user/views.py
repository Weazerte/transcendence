from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import User
from .serializers import UserReadSerializer, UserUpdateSerializer
import os
from django.conf import settings
from django.core.files.storage import default_storage
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
import re

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'patch', 'put', 'post', 'head', 'options']
    parser_classes = (FormParser, JSONParser, MultiPartParser)

    def get_serializer_class(self):
        if self.request.method == 'PATCH' or self.request.method == 'PUT':
            return UserUpdateSerializer
        return UserReadSerializer

    @action(detail=False, methods=['get'], url_path='friends')
    def friends(self, request):
        """Get the authenticated user's friends"""
        friends = request.user.get_friends()
        serializer = self.get_serializer(friends, many=True)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        """Handle PUT requests"""
        if str(request.user.id) != kwargs.get('pk'):
            return Response(
                {"detail": "You can only modify your own profile"},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        """Handle PATCH requests"""
        if str(request.user.id) != kwargs.get('pk'):
            return Response(
                {"detail": "You can only modify your own profile"},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().partial_update(request, *args, **kwargs)

    @action(detail=False, methods=['get', 'patch', 'put'], url_path='me')
    def me(self, request):
        """Get or update the currently authenticated user"""
        if request.method == 'GET':
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)

        # PATCH or PUT request
        serializer = self.get_serializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='friend')
    def add_friend(self, request):
        """Add another user as a friend (one-way)"""
        username = request.data.get('username')

        if not username:
            return Response(
                {"error": "Username is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            friend = User.objects.get(nickname=username)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        if friend.id == request.user.id:
            return Response(
                {"error": "You cannot add yourself as a friend"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if already friends
        if friend in request.user.friends.all():
            return Response(
                {"error": "You are already friends with this user"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Add the friend (one-way)
        request.user.friends.add(friend)

        return Response(
            {"message": f"You are now friends with {friend.username}"},
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['post'], url_path='friend/remove')
    def remove_friend(self, request):
        """Remove a user from friends"""
        username = request.data.get('username')

        if not username:
            return Response(
                {"error": "Username is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            friend = User.objects.get(nickname=username)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if actually friends
        if friend not in request.user.friends.all():
            return Response(
                {"error": "This user is not in your friends list"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Remove the friend
        request.user.friends.remove(friend)

        return Response(
            {"message": f"{friend.username} has been removed from your friends"},
            status=status.HTTP_200_OK
        )
    