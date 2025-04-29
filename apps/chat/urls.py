from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from .views import DirectMessageViewSet
from .middleware import ChatAuthMiddleware
from .consumers import DirectMessageConsumer

router = DefaultRouter()
router.register(r'messages/(?P<user_id>\d+)', DirectMessageViewSet, basename='direct-message')

urlpatterns = [
    path('', include(router.urls)),
] 

ws_urlpatterns = [
    re_path(r'ws/chat/(?P<id>\d+)/$', ChatAuthMiddleware(
        DirectMessageConsumer.as_asgi()
    )),
]