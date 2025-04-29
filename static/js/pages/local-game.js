import { Page } from '../core/Page.js';
import { setupSliders, pregame, animate, initGame } from '../components/local-game.js';
import { pregameSetup, stopPregameAnimations, getIsAnimating } from './pregame.js';

export class LocalGamePage extends Page {
  constructor() {
    super('local-game.html', 'local-game.css');
    this.gameId = null;
    this.gameInstance = null;
    // Default game settings
    this.gameSettings = {
      ballSpeed: 0.2,
      paddleSize: 3,
      paddleSpeed: 0.3,
      ballSize: 0.5,
      winScore: 3,
    };
  }

  onMount() {
    const startGame = document.getElementById('start-game');

    setupSliders();

    pregame();
    pregameSetup();

    startGame.addEventListener('click', async () => {
      try {
        const settingsElements = {
          ballSpeed: document.getElementById('ball-speed'),
          paddleSize: document.getElementById('paddle-size'),
          paddleSpeed: document.getElementById('paddle-speed'),
          ballSize: document.getElementById('ball-size'),
          winScore: document.querySelector('input[name="win-score"]:checked'),
        };

        const player1Name = document.getElementById('player1-name').value.trim();
        const player2Name = document.getElementById('player2-name').value.trim();

        for (const [key, element] of Object.entries(settingsElements)) {
          if (!element) {
            throw new Error(`Missing ${key} setting element`);
          }
        }

        if (!player1Name || !player2Name) {
          throw new Error('Missing player name elements');
        }

        this.gameSettings = {
          ballSpeed: parseFloat(settingsElements.ballSpeed.value),
          paddleSize: parseFloat(settingsElements.paddleSize.value),
          paddleSpeed: parseFloat(settingsElements.paddleSpeed.value),
          ballSize: parseFloat(settingsElements.ballSize.value),
          winScore: parseInt(settingsElements.winScore.value),
        };

        if (getIsAnimating()) stopPregameAnimations();

        document.getElementById('pregame-menu').style.display = 'none';
        document.getElementById('game-container').style.display = 'block';

        this.gameInstance = initGame(this.gameSettings, player1Name, player2Name, 'green', 'blue');

        animate(this.gameInstance, this.gameSettings.winScore);
      } catch (error) {
        console.error('Failed to start game:', error);
        alert('Failed to create game: ' + error.message);
      }
    });
  }
}
