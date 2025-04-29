import { Page } from '../core/Page.js';
import { GameManager } from './gameManager.js';
import { setupSliders, Game, pregame, startGameLoop } from '../components/game.js';
import { pregameSetup, stopPregameAnimations, getIsAnimating } from './pregame.js';

export class GamePage extends Page {
  constructor() {
    super('game.html', 'game.css');
    this.gameManager = new GameManager();
    this.gameId = null;
    this.gameInstance = null; // Store the game instance here
    this.waitingForPlayer = false;
    // Default game settings
    this.gameSettings = {
      ballSpeed: 0.2,
      paddleSize: 3,
      paddleSpeed: 0.3,
      ballSize: 0.5,
      winScore: 3,
    };
  }

  async beforeMount(params) {
    // Check if there are URL parameters
    const urlParams = new URLSearchParams(window.location.search);

    // Handle joining a game directly from chat
    if (urlParams.has('joinGame')) {
      this.joinGameId = urlParams.get('joinGame');
    }

    // Handle waiting for a player (after creating a game from chat)
    if (urlParams.has('waitingGame')) {
      this.waitingGameId = urlParams.get('waitingGame');
    }

    return true;
  }

  async onMount() {
    console.log('Game page mounted');
    const startGame = document.getElementById('start-game');
    const joinGameButton = document.getElementById('join-game');

    setupSliders();

    // pregame();
    pregameSetup();
    // Écouter les mises à jour du jeu
    document.addEventListener('game-update', event => {
      this.handleGameUpdate(event.detail);
    });

    const urlParams = new URLSearchParams(window.location.search);

    // Check if we need to join a game directly (from chat)
    if (urlParams.has('joinGame')) {
      this._joinGame(urlParams.get('joinGame'));
    }

    // Check if we need to show waiting screen (after creating a game from chat)
    if (urlParams.has('waitingGame')) {
      const gameId = await this.gameManager.createGame(urlParams.get('waitingGame'));
      this.gameId = gameId;
      this._setupWaitingScreen(this.gameId);
    }

    joinGameButton.addEventListener('click', async e => {
      const gameIDInput = document.getElementById('game-id-input');
      if (!gameIDInput) {
        console.error('Game ID input not found in the DOM');
        return;
      }

      const gameID = gameIDInput.value.trim();

      if (!gameID) {
        alert('Please enter a game ID');
        return;
      }

      this._joinGame(gameID);
    });

    startGame.addEventListener('click', async () => {
      try {
        const settingsElements = {
          ballSpeed: document.getElementById('ball-speed'),
          paddleSize: document.getElementById('paddle-size'),
          paddleSpeed: document.getElementById('paddle-speed'),
          ballSize: document.getElementById('ball-size'),
          winScore: document.querySelector('input[name="win-score"]:checked'),
        };

        // Check if all elements exist
        for (const [key, element] of Object.entries(settingsElements)) {
          if (!element) {
            throw new Error(`Missing ${key} setting element`);
          }
        }

        this.gameSettings = {
          ballSpeed: parseFloat(settingsElements.ballSpeed.value),
          paddleSize: parseFloat(settingsElements.paddleSize.value),
          paddleSpeed: parseFloat(settingsElements.paddleSpeed.value),
          ballSize: parseFloat(settingsElements.ballSize.value),
          winScore: parseInt(settingsElements.winScore.value),
        };

        // Create the game
        const gameId = await this.gameManager.createGame();
        this.gameId = gameId;

        this._setupWaitingScreen(this.gameId);
      } catch (error) {
        console.error('Failed to start game:', error);
        alert('Failed to create game: ' + error.message);
      }
    });
  }

  /**
   * Setup the waiting screen with the game ID
   * @private
   *
   * @param {string} gameId - The game ID
   */
  _setupWaitingScreen(gameId) {
    this.gameId = gameId;

    // Show waiting screen
    if (getIsAnimating()) stopPregameAnimations();
    document.getElementById('pregame-menu').style.display = 'none';
    document.getElementById('waiting-screen').style.display = 'flex';
    document.getElementById('waiting-game-id').textContent = this.gameId;

    this.waitingForPlayer = true;

    // Clear URL parameters
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  /**
   * Join a game with the given ID
   * @private
   *
   * @param {string} gameId - The game ID to join
   */
  async _joinGame(gameId) {
    try {
      await this.gameManager.joinGame(gameId);
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error('Failed to join game:', error);
      alert('Failed to join game: ' + error.message);
    }
  }

  handleGameUpdate(data) {
    switch (data.type) {
      case 'player_joined':
        if (this.waitingForPlayer && data.player === 'right') {
          // Show player 2 joined message
          const waitingMessage = document.getElementById('waiting-message');
          if (waitingMessage) {
            waitingMessage.textContent = 'Player 2 joined! Sending game settings...';
          }
          // Send settings to player 2
          this.gameManager.sendGameEvent('game-settings', {
            settings: this.gameSettings,
            gameId: this.gameId,
          });
          this.gameManager.sendReadyStatus();
        }
        break;

      case 'game-settings':
        if (this.gameManager.localPlayer === 'right') {
          // Validate received settings
          this.gameSettings = data.settings;
          this.gameManager.sendReadyStatus();
        }
        break;

      case 'game_start':
        // Hide appropriate screens based on player type
        if (this.gameManager.localPlayer === 'left') {
          document.getElementById('waiting-screen').style.display = 'none';
        } else {
          // For right player, hide pregame menu
          document.getElementById('pregame-menu').style.display = 'none';
        }
        document.getElementById('game-container').style.display = 'flex';
        const leftPlayerNickname = data.player_left_nickname;
        const rightPlayerNickname = data.player_right_nickname;

        this.gameInstance = new Game(
          this.gameSettings.ballSpeed,
          this.gameSettings.paddleSize,
          this.gameSettings.paddleSpeed,
          this.gameSettings.ballSize,
          this.gameSettings.winScore,
          this.gameManager,
          leftPlayerNickname,
          rightPlayerNickname
        );
        startGameLoop(this.gameInstance, this.gameInstance.winScore);
        break;

      case 'end_game':
        this.gameInstance.endgame();
        break;

      case 'player_move':
        // Only process moves if we have a game instance
        if (!this.gameInstance) return;

        // Mouvement du joueur distant (opposé au joueur local)
        if (data.player === 'left' && this.gameManager.localPlayer === 'right') {
          if (data.direction === 'up') {
            this.gameInstance.playerLeft.moveUp();
          } else if (data.direction === 'down') {
            this.gameInstance.playerLeft.moveDown();
          } else if (data.direction === 'stop') {
            this.gameInstance.playerLeft.dy = 0;
          }
        } else if (data.player === 'right' && this.gameManager.localPlayer === 'left') {
          if (data.direction === 'up') {
            this.gameInstance.playerRight.moveUp();
          } else if (data.direction === 'down') {
            this.gameInstance.playerRight.moveDown();
          } else if (data.direction === 'stop') {
            this.gameInstance.playerRight.dy = 0;
          }
        }
        break;
    }
  }
}
