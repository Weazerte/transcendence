import { getCookie } from '../utils/cookies.js';

export class GameManager {
  constructor() {
    this.gameSocket = null;
    this.gameId = null;
    this.localPlayer = null; // 'left' ou 'right'
    this.readyState = false;

    document.addEventListener('routeChange', () => {
      if (this.gameSocket && this.gameSocket.readyState === WebSocket.OPEN) {
        this.gameSocket.close();
      }
    });
  }

  async joinGame(gameId) {
    try {
      const response = await fetch('/api/game/join/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getCookie('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gameId: gameId }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.error || 'Failed to join game');
      }

      const gameData = await response.json();
      console.log('Joined game:', gameData);

      this.gameId = gameData.game_id;
      this.localPlayer = 'right'; // Player 2 is always on the right

      const socket = await this.initializeGameSocket(gameData.game_id);
      if (!socket) {
        throw new Error(`Failed to connect websocket for game: ${this.gameId}`);
      } else {
        // Notify that player 2 has joined
        this.sendGameEvent('player_joined', {
          player: this.localPlayer,
          game_id: this.gameId,
        });

        // Show game interface
        document.getElementById('pregame-menu').style.display = 'none';
        document.getElementById('game-container').style.display = 'block';
      }

      return gameData;
    } catch (error) {
      console.error('Error joining game:', error);
      throw error;
    }
  }

  /**
   * Create a new game
   * @param {string} [gameId] - The game ID to use, if null a new game will be created
   * @returns {string} - The game ID
   */
  async createGame(gameId = null) {
    this.gameId = gameId;
    if (gameId === null || gameId === undefined) {
      const response = await fetch('/api/game/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getCookie('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create game');
      }

      const data = await response.json();
      this.gameId = data.game_id;
    }

    this.localPlayer = 'left';
    await this.initializeGameSocket(this.gameId);

    return this.gameId;
  }

  async initializeGameSocket(gameId) {
    return new Promise((resolve, reject) => {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
      const wsUrl = `${wsProtocol}${window.location.host}/ws/game/${gameId}`;

      const ws = new WebSocket(wsUrl);

      ws.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received game update:', data);

          // Dispatch a custom event to the game page
          const gameEvent = new CustomEvent('game-update', {
            detail: data,
          });
          document.dispatchEvent(gameEvent);
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };

      ws.onclose = event => {
        console.log('WebSocket connection closed:', event.code, event.reason);

        // Try to reconnect if it wasn't a normal closure
        if (event.code !== 1000) {
          console.log('Attempting to reconnect...');
          setTimeout(() => this.initializeGameSocket(gameId), 3000);
        }
      };

      ws.onerror = error => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      ws.onopen = () => {
        console.log('WebSocket connected for game:', gameId);
        this.gameSocket = ws;
        resolve(ws);
      };
    });
  }

  // Method to mark this player as ready
  sendReadyStatus() {
    this.sendGameEvent('ready', {
      player: this.localPlayer,
      game_id: this.gameId,
    });
    this.readyState = true;
  }

  // Method to send player movements
  sendPlayerMove(direction) {
    if (!this.gameSocket || this.gameSocket.readyState !== WebSocket.OPEN) {
      console.error('WebSocket connection not open');
      return;
    }

    this.gameSocket.send(
      JSON.stringify({
        type: 'player_move',
        player: this.localPlayer,
        direction: direction, // 'up', 'down' or 'stop'
      })
    );
  }

  // Method to send any game events
  sendGameEvent(eventType, data = {}) {
    if (!this.gameSocket || this.gameSocket.readyState !== WebSocket.OPEN) {
      console.error('WebSocket connection not open');
      return;
    }

    this.gameSocket.send(
      JSON.stringify({
        type: eventType,
        ...data,
      })
    );
  }

  // Method to send hit ball events
  sendHitBall(hitPosition, direction, paddlePosition) {
    this.sendGameEvent('hit_ball', {
      hit_position: hitPosition,
      direction: direction,
      paddle_position: paddlePosition,
      player: this.localPlayer,
    });
  }
}
