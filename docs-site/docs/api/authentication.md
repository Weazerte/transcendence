# Authentication API

The authentication API handles user authentication and authorization.

## Endpoints

### OAuth Authentication

#### GET `/api/auth/42/authorize/`

Redirects the user to the 42 OAuth authorization page.

#### GET `/api/auth/42/callback/`

Handles the OAuth callback from 42 and sets authentication cookies.

**Query Parameters:**

- `code`: OAuth authorization code

**Response:**

- Redirects to the home page on success
- Redirects to login page with error on failure

### JWT Token Management

#### POST `/api/auth/token/refresh/`

Refreshes the access token using the refresh token.

**Request:**
No body required, uses the refresh token cookie.

**Response:**

```json
{
  "access": "new.access.token"
}
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant 42OAuth
    
    User->>Frontend: Initiates login
    Frontend->>Backend: GET /api/auth/42/authorize/
    Backend->>42OAuth: Redirects to 42 OAuth page
    42OAuth->>User: Displays login form
    User->>42OAuth: Enters credentials
    42OAuth->>Backend: Redirects with auth code
    Backend->>42OAuth: Validates OAuth token
    42OAuth->>Backend: Returns user info
    Backend->>Backend: Issues JWT tokens
    Backend->>Frontend: Sets HttpOnly cookies
    Frontend->>User: Redirects to home page
    
    Note over User,Backend: Subsequent API Requests
    User->>Frontend: Makes API request
    Frontend->>Backend: Request with JWT in cookie
    Backend->>Frontend: Protected resource
```