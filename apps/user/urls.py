from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from .middleware import UserAuthMiddleware
from .consumers import UserStatusConsumer

router = DefaultRouter()

urlpatterns = [
    path('', include(router.urls)),
]

ws_urlpatterns = [
    re_path(r'ws/user/status$', UserAuthMiddleware(
        UserStatusConsumer.as_asgi()
    )),
]