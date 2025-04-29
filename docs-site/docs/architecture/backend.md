# Backend Architecture

The backend follows Django's modular architecture pattern.

## Core Configuration

Located in the `transcendence/` directory:

- **settings.py**: Project-wide settings

    - Installed apps
    - Middleware configuration
    - Database settings
    - Authentication backends
    - WebSocket configuration

- **urls.py**: Main URL routing configuration

    - API endpoints
    - Admin interface
    - Catch-all route for SPA

- **asgi.py**: ASGI configuration for WebSocket support

## Apps Structure

Each app in the `apps/` directory represents a distinct feature:

### User App (`apps/user/`)

Handles user profiles and social features:

- **models.py**: Defines `User` model and related models
- **views.py**: API endpoints for user data
- **serializers.py**: Data serialization for API responses

### Authentication App (`apps/authentication/`)

Manages authentication and authorization:

- **views.py**: Handles login, logout, and OAuth flows
- **serializers.py**: Serializes authentication data

### Game App (`apps/game/`)

Manages game logic and multiplayer functionality:

- **models.py**: Defines `Game` model and related models
- **views.py**: API endpoints for game data
- **consumers.py**: WebSocket consumers for real-time game updates

## API Structure

The API follows REST principles:

- **Endpoints**: `/api/<resource>/`
- **Authentication**: JWT tokens via cookies
- **Documentation**: Available at `/api/docs/`

## Database Schema

Key models and their relationships:

- **User**: Extended Django user model
- **Game**: Records of games played
- **Friendship**: Connections between users
