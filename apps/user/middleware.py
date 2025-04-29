from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from django.conf import settings
from urllib.parse import parse_qs
from django.contrib.auth import get_user_model

class UserAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        headers = dict(scope["headers"])
        cookie_string = headers.get(b'cookie', b'').decode()
        token = None
        if 'access_token=' in cookie_string:
            token = cookie_string.split('access_token=')[1].split(';')[0]

        scope['user'] = await self.get_user(token)
        return await super().__call__(scope, receive, send)

    @database_sync_to_async
    def get_user(self, token):
        if not token:
            return AnonymousUser()
        
        try:
            access_token = AccessToken(token)
            user_id = access_token.get('user_id')
            User = get_user_model()
            user = User.objects.get(id=user_id)
            return user
        except Exception:
            return AnonymousUser() 