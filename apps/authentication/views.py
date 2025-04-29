from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponseRedirect
from apps.user.models import User
from .serializers import AuthSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
import os
import requests

class FortyTwoAuthView(viewsets.ViewSet):
    """Authentication view for 42"""
    permission_classes = [permissions.AllowAny]
    serializer_class = AuthSerializer

    def get_forty_two_access_token(self, code):
        """Get access token from 42 API using the authorization code"""
        data = {
            'grant_type': 'authorization_code',
            'client_id': os.getenv('OAUTH_42_UID'),
            'client_secret': os.getenv('OAUTH_42_SECRET'),
            'code': code,
        }

        token_uri = f"{os.getenv('OAUTH_42_TOKEN_URI')}?client_id={os.getenv('OAUTH_42_UID')}&client_secret={os.getenv('OAUTH_42_SECRET')}&code={code}&redirect_uri={os.getenv('OAUTH_42_REDIRECT_URI')}"
        response = requests.post(token_uri, data=data)
        if response.status_code != 200:
            raise Exception('Failed to exchange code for token')

        return response.json().get('access_token')

    def get_forty_two_user(self, access_token):
        """Get user info from 42 API using the access token"""
        user_uri = f"{os.getenv('OAUTH_42_USER_URI')}"
        response = requests.get(user_uri, headers={'Authorization': f'Bearer {access_token}'})
        if response.status_code != 200:
            raise Exception('Failed to get user info')

        return response.json()

    @action(detail=False, methods=['get'], url_path='authorize')
    def authorize(self, request):
        """Retourne l'URL d'autorisation 42"""
        oauth_uri = f"{os.getenv('OAUTH_42_AUTH_URI')}?client_id={os.getenv('OAUTH_42_UID')}&redirect_uri={os.getenv('OAUTH_42_REDIRECT_URI')}&response_type=code"
        return Response({'redirect_url': oauth_uri})  # On envoie l'URL au frontend

    @action(detail=False, methods=['get'], url_path='callback')
    def callback(self, request):
        """Callback from 42 OAuth authorization page"""
        code = request.query_params.get('code')

        if not code:
            return Response(
                {'error': 'No code provided'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Get OAuth tokens and user info
            forty_two_access_token = self.get_forty_two_access_token(code)

            forty_two_user = self.get_forty_two_user(forty_two_access_token)

            user = User.objects.filter(username=forty_two_user['login']).first()
            if not user:
                # Get or create user
                user = User.objects.create_user(
                    username=forty_two_user['login'],
                    email=forty_two_user['email'],
                    first_name=forty_two_user['first_name'],
                    last_name=forty_two_user['last_name'],
                    nickname=forty_two_user['login'],  # Default nickname to 42 login
                )
            else:
                user.email = forty_two_user['email']
                user.first_name = forty_two_user['first_name']
                user.last_name = forty_two_user['last_name']
                user.save()


            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)

            # Redirect to frontend with access and refresh tokens
            response = HttpResponseRedirect('/profile')

            response.set_cookie(
                'access_token',
                str(refresh.access_token),
                secure=False,
                samesite='Lax',
                max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()
            )

            response.set_cookie(
                'refresh_token',
                str(refresh),
                httponly=True,
                secure=False,
                samesite='Lax',
                max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds()
            )

            return response

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class AuthView(viewsets.ViewSet):
    """Default authentication view"""
    permission_classes = [permissions.AllowAny]
    serializer_class = AuthSerializer

    @action(detail=False, methods=['post'], url_path='refresh')
    def refresh(self, request):
        """Refresh JWT tokens"""
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            return Response({'error': 'No refresh token provided'}, status=status.HTTP_400_BAD_REQUEST)

        refresh = RefreshToken(refresh_token)
        if refresh.check_exp():
            return Response({'error': 'Refresh token expired'}, status=status.HTTP_400_BAD_REQUEST)

        # Get user ID from token payload and fetch user
        user_id = refresh.payload.get('user_id')
        user = User.objects.get(id=user_id)
        
        # Generate new tokens
        refresh = RefreshToken.for_user(user)
        
        response = Response({
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
        })

        response.set_cookie(
            'access_token',
            str(refresh.access_token),
            secure=False,
            samesite='Lax',
            max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()
        )

        response.set_cookie(
            'refresh_token',
            str(refresh),
            httponly=True,
            secure=False,
            samesite='Lax',
            max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds()
        )

        return response

    @action(detail=False, methods=['post'], url_path='fake-signin')
    def fake_signin(self, request):
        """Sign in with a fake user for development purposes"""
        # Only allow in development mode
        if not settings.DEBUG:
            return Response(
                {'error': 'This endpoint is only available in development mode'},
                status=status.HTTP_403_FORBIDDEN
            )

        username = request.data.get('username')
        if not username:
            return Response(
                {'error': 'Username is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Try to get existing user or create a new one
        user = User.objects.filter(username=username).first()
        if not user:
            # Create a fake user
            user = User.objects.create_user(
                username=username,
                email=f"{username}@fake.com",
                first_name=f"Fake {username}",
                last_name="User",
                nickname=username,
            )

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        response = Response({
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
        })

        response.set_cookie(
            'access_token',
            str(refresh.access_token),
            secure=False,
            samesite='Lax',
            max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()
        )

        response.set_cookie(
            'refresh_token',
            str(refresh),
            httponly=True,
            secure=False,
            samesite='Lax',
            max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds()
        )

        return response