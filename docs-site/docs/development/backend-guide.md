# Backend Development Guide

## Django Basics

Django follows the Model-View-Template (MVT) pattern:

- **Models**: Define your data structure
- **Views**: Handle HTTP requests and return responses
- <del>**Templates**: Define how data is presented</del>

!!! warning "We do not use Django's default template engine"
     We do not use Django's default template engine, unless for serving the `index.html` file.
     This is because we use a custom SPA for the frontend.

## Creating a New App

1. Use the Makefile command:
   ```bash
   make create app your_app_name
   ```

2. Define models in `apps/your_app_name/models.py`:
   ```python
   from django.db import models

   class YourModel(models.Model):
       name = models.CharField(max_length=100)
       description = models.TextField()
       created_at = models.DateTimeField(auto_now_add=True)

       def __str__(self):
           return self.name
   ```

3. Create migrations:
   ```bash
   make create migrations your_app_name
   ```

4. Apply migrations:
   ```bash
   make migrate
   ```

## Creating API Endpoints

1. Define serializers in `apps/your_app_name/serializers.py`:
   ```python
   from rest_framework import serializers
   from .models import YourModel

   class YourModelSerializer(serializers.ModelSerializer):
       class Meta:
           model = YourModel
           fields = ['id', 'name', 'description', 'created_at']
   ```

2. Create ViewSets in `apps/your_app_name/views.py`:
   ```python
   from rest_framework import viewsets
   from .models import YourModel
   from .serializers import YourModelSerializer

   class YourModelViewSet(viewsets.ModelViewSet):
       queryset = YourModel.objects.all()
       serializer_class = YourModelSerializer
   ```

3. Register routes in `transcendence/urls.py`:
   ```python
   from apps.your_app_name.views import YourModelViewSet

   router = routers.DefaultRouter()
   # Add your viewset to the router
   router.register(r'your-model', YourModelViewSet)

   urlpatterns = [
       # Existing paths...
       path('api/', include(router.urls)),
   ]
   ```

## Authentication

The project uses JWT authentication with Django REST Framework Simple JWT:

- Access tokens are short-lived (60 minutes)
- Refresh tokens are longer-lived (1 day)
- Tokens are stored in HttpOnly cookies for security

To access the current user in a view:

```python
request.user  # The authenticated user
```

To require authentication for a view:

```python
from rest_framework.permissions import IsAuthenticated

class YourView(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
```

## Testing API Endpoints

You can test your API endpoints using the Swagger UI at [/api/docs/](http://localhost:8000/api/docs/).
