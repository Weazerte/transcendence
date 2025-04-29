"""
URL configuration for transcendence project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework import routers
from apps.user.views import UserViewSet
from apps.authentication.views import AuthView, FortyTwoAuthView
from templates.views import index
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from django.views.static import serve
import os
from pathlib import Path
from apps.chat.views import DirectMessageViewSet
from django.conf import settings
from django.conf.urls.static import static
from apps.game.views import gameViewset

BASE_DIR = Path(__file__).resolve().parent.parent

router = routers.DefaultRouter()
router.register(r'user', UserViewSet, basename='user')
router.register(r'auth', AuthView, basename='auth')
router.register(r'auth/42', FortyTwoAuthView, basename='auth_42')
router.register(r'game', gameViewset, basename='game')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/chat/', include('apps.chat.urls')),
    # OpenAPI schema endpoints
    path('api/schema', SpectacularAPIView.as_view(), name='schema'),
    # Optional UI endpoints
    path('api/docs', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    path('__reload__/', include('django_browser_reload.urls')),
    # Catch all routes to the index view
    # This is used to handle the SPA routing in the frontend
    re_path(r'^(?!media|api|admin|__reload__).*$', index, name='index'),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
