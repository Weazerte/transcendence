# Game API

## Game Flow

### Standard Flow

This diagram shows the standard flow for creating and joining a game. The game record is stored in the games table with a unique "code" field for joining and status "waiting" initially, then "active" when Player2 joins.

```mermaid
sequenceDiagram
    participant Host
    participant API as Game API
    participant WS as WebSocket Server
    participant DB as Database
    participant Player2

    Host->>API: POST /game
    API->>DB: Create game room
    DB-->>API: Return game code
    API-->>Host: Response with game code

    Host->>WS: Connect to WebSocket with game code
    WS->>DB: Verify game code exists
    DB-->>WS: Confirm game exists
    WS-->>Host: Connection established

    Note over Host,Player2: Host shares game code with Player2

    Player2->>WS: Connect to WebSocket with game code
    WS->>DB: Verify game code exists
    DB-->>WS: Confirm game exists
    WS-->>Player2: Connection established
    
    WS->>Host: Notify Player2 joined
    WS->>Player2: Notify connected to game
```

### Edge Cases

#### Case 1: The game is full

When a third player attempts to join a game that already has the maximum number of players (2), the connection is rejected.

```mermaid
sequenceDiagram
    participant Player3
    participant WS as WebSocket Server
    participant DB as Database

    Player3->>WS: Connect to WebSocket with game code
    WS->>DB: Verify game code exists and check player count
    DB-->>WS: Game exists but already has max players
    WS-->>Player3: Connection rejected (Game full)
```

#### Case 2: The Game doesn't exist

When a player attempts to join a game with an invalid game code, the connection is rejected. This prevents connections to non-existent game rooms.

```mermaid
sequenceDiagram
    participant Player
    participant WS as WebSocket Server
    participant DB as Database

    Player->>WS: Connect to WebSocket with invalid game code
    WS->>DB: Verify game code exists
    DB-->>WS: Game code not found
    WS-->>Player: Connection rejected (Game not found)
```

#### Case 3: Game Completion

When a game completes normally with a winner, the game code is set to NULL but the record remains in the database with the game results and winner information.

```mermaid
sequenceDiagram
    participant Host
    participant Player2
    participant WS as WebSocket Server
    participant DB as Database

    Note over Host,Player2: Game in progress (status: "active")
    
    Note over Host,Player2: Game concludes with a winner
    WS->>DB: Update game (status: "completed", set winner, set code to NULL)
    WS->>Host: Notify game ended with results
    WS->>Player2: Notify game ended with results
    
    Note over Host,Player2: Players can disconnect
    Host->>WS: Disconnect from WebSocket
    Player2->>WS: Disconnect from WebSocket
```

#### Case 4: All Players Leave the Game Prematurely

When all players disconnect from an active game, the game is marked as abandoned but remains in the database with its code set to NULL.

```mermaid
sequenceDiagram
    participant Host
    participant Player2
    participant WS as WebSocket Server
    participant DB as Database

    Note over Host,Player2: Game in progress (status: "active")
    
    Host->>WS: Disconnect from WebSocket
    WS->>DB: Update game state (Host left)
    WS->>Player2: Notify Host disconnected
    
    Player2->>WS: Disconnect from WebSocket
    WS->>DB: Update game state (Player2 left)
    WS->>DB: Check if game is empty
    DB-->>WS: Confirm game is empty
    WS->>DB: Update game (status: "abandoned", set code to NULL)
```