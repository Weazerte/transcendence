"""
ASGI config for transcendence project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'transcendence.settings')

django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from apps.user.urls import ws_urlpatterns as user_ws_urlpatterns
from apps.game.urls import ws_urlpatterns as game_ws_urlpatterns
from apps.chat.urls import ws_urlpatterns as chat_ws_urlpatterns

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter([
            *user_ws_urlpatterns,
            *game_ws_urlpatterns,
            *chat_ws_urlpatterns
        ])
    ),
})