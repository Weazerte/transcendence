# Users API

The Users API handles user profiles, social features, and user statistics.

## Endpoints

### GET `/api/user/me/`

Retrieves the current user's profile.

**Response:**

```json
{
  "id": 1,
  "username": "user1",
  "intra_id": "intra42_id",
  "avatar": "https://example.com/avatars/user1.jpg",
  "two_factor_enabled": false,
  "wins": 10,
  "losses": 5,
  "rank": 1500
}
```

### GET `/api/user/{id}/`

Retrieves a specific user's profile.

**URL Parameters:**

- `id`: User ID

**Response:**

```json
{
  "id": 2,
  "username": "user2",
  "avatar": "https://example.com/avatars/user2.jpg",
  "wins": 15,
  "losses": 8,
  "rank": 1650
}
```

### GET `/api/user/`

Retrieves a list of users, with pagination.

**Query Parameters:**

- `page`: Page number (default: 1)
- `search`: Search term for username (optional)

**Response:**

```json
{
  "count": 50,
  "next": "http://example.com/api/user/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "username": "user1",
      "avatar": "https://example.com/avatars/user1.jpg"
    },
    {
      "id": 2,
      "username": "user2",
      "avatar": "https://example.com/avatars/user2.jpg"
    }
  ]
}
```

### PATCH `/api/user/me/`

Updates the current user's profile.

**Request:**

```json
{
  "username": "new_username",
  "avatar": "base64_encoded_image"
}
```

**Response:**

```json
{
  "id": 1,
  "username": "new_username",
  "avatar": "https://example.com/avatars/new_avatar.jpg",
  "two_factor_enabled": false,
  "wins": 10,
  "losses": 5,
  "rank": 1500
}
```

## JavaScript Examples

```javascript
// Get current user profile
async function getCurrentUser() {
  const response = await fetch('/api/user/me/', {
    credentials: 'include',
  });
  if (response.ok) {
    return await response.json();
  }
  return null;
}

// Update user profile
async function updateProfile(data) {
  const response = await fetch('/api/user/me/', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (response.ok) {
    return await response.json();
  }
  throw new Error('Failed to update profile');
}
```
