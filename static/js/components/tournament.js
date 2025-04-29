import { Game, tournamentAnimate } from './local-game.js';

export class Tournament {
  constructor(player1, player2, player3, player4) {
    this.player1 = player1;
    this.player2 = player2;
    this.player3 = player3;
    this.player4 = player4;
    this.player1Color = 'green';
    this.player2Color = 'blue';
    this.player3Color = 'purple';
    this.player4Color = 'yellow';
    this.loser1 = null;
    this.loser1Color = null;
    this.loser2 = null;
    this.loser2Color = null;
    this.loser3 = null;
    this.winner1 = null;
    this.winner1Color = null;
    this.winner2 = null;
    this.winner2Color = null;
    this.match = 0;
    this.third = null;
    this.scnd = null;
    this.champion = null;

    this.matchAnnouncement = document.getElementById('match-announcement');
    this.gameContainer = document.getElementById('tournament-game-container');
    this.endGameScreen = document.getElementById('tournament-end-game-screen');
    this.resultsScreen = document.getElementById('tournament-results');

    this.setupNextMatchButton();
  }

  startMatch() {
    if (document.getElementById('player-registration').style.display === 'block') {
      document.getElementById('player-registration').style.display = 'none';
    }
    if (this.endGameScreen.style.display === 'flex') {
      this.endGameScreen.style.display = 'none';
    }

    document.getElementById('match-number').textContent = this.match + 1;

    this.matchAnnouncement.style.display = 'block';

    const matchPlayer1 = document.getElementById('match-player1');
    const matchPlayer2 = document.getElementById('match-player2');

    const leftAvatar = document.querySelector('.player-avatar.left');
    const rightAvatar = document.querySelector('.player-avatar.right');

    if (this.match === 0) {
      matchPlayer1.textContent = this.player1;
      matchPlayer2.textContent = this.player2;

      leftAvatar.style.backgroundColor = this.player1Color;
      rightAvatar.style.backgroundColor = this.player2Color;
    } else if (this.match === 1) {
      matchPlayer1.textContent = this.player3;
      matchPlayer2.textContent = this.player4;

      leftAvatar.style.backgroundColor = this.player3Color;
      rightAvatar.style.backgroundColor = this.player4Color;
    } else if (this.match === 2) {
      matchPlayer1.textContent = this.loser1;
      matchPlayer2.textContent = this.loser2;

      leftAvatar.style.backgroundColor = this.loser1Color;
      rightAvatar.style.backgroundColor = this.loser2Color;
    } else {
      matchPlayer1.textContent = this.winner1;
      matchPlayer2.textContent = this.winner2;

      leftAvatar.style.backgroundColor = this.winner1Color;
      rightAvatar.style.backgroundColor = this.winner2Color;
    }

    const startMatchBtn = document.getElementById('start-match');
    const newStartBtn = startMatchBtn.cloneNode(true);
    startMatchBtn.parentNode.replaceChild(newStartBtn, startMatchBtn);

    newStartBtn.addEventListener('click', () => this.startGame());
  }

  startGame() {
    this.matchAnnouncement.style.display = 'none';
    this.gameContainer.style.display = 'block';
    const canvas = document.getElementById('pongCanvas');
    canvas.width = 1200;
    canvas.height = 800;

    if (this.match === 0) {
      this.gameInstance = new Game(
        0.2,
        3,
        0.3,
        0.5,
        3,
        this.player1,
        this.player2,
        this.player1Color,
        this.player2Color
      );
    } else if (this.match === 1) {
      this.gameInstance = new Game(
        0.2,
        3,
        0.3,
        0.5,
        3,
        this.player3,
        this.player4,
        this.player3Color,
        this.player4Color
      );
    } else if (this.match === 2) {
      this.gameInstance = new Game(
        0.2,
        3,
        0.3,
        0.5,
        3,
        this.loser1,
        this.loser2,
        this.loser1Color,
        this.loser2Color
      );
    } else {
      this.gameInstance = new Game(
        0.2,
        3,
        0.3,
        0.5,
        3,
        this.winner1,
        this.winner2,
        this.winner1Color,
        this.winner2Color
      );
    }
    this.gameInstance.renderer.setSize(canvas.width, canvas.height);
    this.gameInstance.camera.aspect = canvas.width / canvas.height;
    this.gameInstance.camera.updateProjectionMatrix();

    this.gameInstance.isGameRunning = true;
    tournamentAnimate(this.gameInstance, 3, () => {
      this.endGame();
    });
  }

  endGame() {
    this.gameContainer.style.display = 'none';

    const leftScore = this.gameInstance.playerLeft.getScore();
    const rightScore = this.gameInstance.playerRight.getScore();

    const isLeftWinner = leftScore > rightScore;

    const winnerNameElement = document.getElementById('winner-name');

    if (this.match === 0) {
      if (isLeftWinner) {
        this.winner1 = this.gameInstance.leftPlayerNickname;
        this.winner1Color = this.player1Color;
        this.loser1 = this.gameInstance.rightPlayerNickname;
        this.loser1Color = this.player2Color;
      } else {
        this.winner1 = this.gameInstance.rightPlayerNickname;
        this.winner1Color = this.player2Color;
        this.loser1 = this.gameInstance.leftPlayerNickname;
        this.loser1Color = this.player1Color;
      }
      const loserfinalist1 = document.getElementById('bracket-loserfinalist1');
      if (loserfinalist1) loserfinalist1.textContent = this.loser2;
      const finalist1 = document.getElementById('bracket-finalist1');
      if (finalist1) finalist1.textContent = this.winner1;
      winnerNameElement.textContent = `${this.winner1} Wins!`;
    } else if (this.match === 1) {
      if (isLeftWinner) {
        this.winner2 = this.gameInstance.leftPlayerNickname;
        this.winner2Color = this.player3Color;
        this.loser2 = this.gameInstance.rightPlayerNickname;
        this.loser2Color = this.player4Color;
      } else {
        this.winner2 = this.gameInstance.rightPlayerNickname;
        this.winner2Color = this.player4Color;
        this.loser2 = this.gameInstance.leftPlayerNickname;
        this.loser2Color = this.player3Color;
      }
      const loserfinalist2 = document.getElementById('bracket-loserfinalist2');
      if (loserfinalist2) loserfinalist2.textContent = this.loser2;
      const finalist2 = document.getElementById('bracket-finalist2');
      if (finalist2) finalist2.textContent = this.winner2;
      winnerNameElement.textContent = `${this.winner1} Wins!`;
    } else if (this.match === 2) {
      if (isLeftWinner) {
        this.third = this.gameInstance.leftPlayerNickname;
        this.loser3 = this.gameInstance.rightPlayerNickname;
      } else {
        this.third = this.gameInstance.rightPlayerNickname;
        this.loser3 = this.gameInstance.leftPlayerNickname;
      }
    } else if (this.match === 3) {
      if (isLeftWinner) {
        this.champion = this.winner1;
        this.scnd = this.winner2;
      } else {
        this.champion = this.winner2;
        this.scnd = this.winner1;
      }

      this.showTournamentResults(this.champion, this.scnd);
      return;
    }

    const finalScoreElement = document.getElementById('final-score');
    if (finalScoreElement) {
      finalScoreElement.textContent = `${this.gameInstance.leftPlayerNickname} ${leftScore} - ${rightScore} ${this.gameInstance.rightPlayerNickname}`;
    }

    this.endGameScreen.style.display = 'flex';

    this.setupNextMatchButton();
  }

  setupNextMatchButton() {
    const nextMatchButton = document.getElementById('next-match');
    if (!nextMatchButton) return;

    const newNextButton = nextMatchButton.cloneNode(true);
    nextMatchButton.parentNode.replaceChild(newNextButton, nextMatchButton);

    newNextButton.addEventListener('click', () => {
      this.endGameScreen.style.display = 'none';
      this.match++;
      this.startMatch();
    });
  }

  showTournamentResults(champion, runnerUp) {
    this.gameContainer.style.display = 'none';
    this.endGameScreen.style.display = 'none';

    document.getElementById('champion-name').textContent = champion;
    document.getElementById('first-place-name').textContent = champion;
    document.getElementById('second-place-name').textContent = runnerUp;

    document.getElementById('third-place-name').textContent = this.loser3;

    document.getElementById('result-player1').textContent = this.player1;
    document.getElementById('result-player2').textContent = this.player2;
    document.getElementById('result-player3').textContent = this.player3;
    document.getElementById('result-player4').textContent = this.player4;
    document.getElementById('result-loserfinalist1').textContent = this.loser1;
    document.getElementById('result-loserfinalist2').textContent = this.loser2;
    document.getElementById('result-finalist1').textContent = this.winner1;
    document.getElementById('result-finalist2').textContent = this.winner2;

    if (champion === this.winner1) {
      document.getElementById('result-finalist1').classList.add('winner');
      document.getElementById('result-finalist2').classList.remove('winner');
    } else {
      document.getElementById('result-finalist2').classList.add('winner');
      document.getElementById('result-finalist1').classList.remove('winner');
    }

    this.resultsScreen.style.display = 'block';
    this.setupResultsButtons();
  }

  setupResultsButtons() {
    const newTournamentBtn = document.getElementById('new-tournament');
    newTournamentBtn.addEventListener('click', () => {
      this.resultsScreen.style.display = 'none';
      document.getElementById('player-registration').style.display = 'block';
      this.resetTournament();
    });

    const mainMenuBtn = document.getElementById('main-menu');
    mainMenuBtn.addEventListener('click', () => {
      this.resultsScreen.style.display = 'none';
      document.getElementById('tournament-menu').style.display = 'block';
      this.resetTournament();
    });
  }

  resetTournament() {
    this.winner1 = null;
    this.winner2 = null;
    this.loser1 = null;
    this.loser2 = null;
    this.match = 0;
    this.champion = null;

    document.getElementById('bracket-finalist1').textContent = 'Winner 1';
    document.getElementById('bracket-finalist2').textContent = 'Winner 2';

    document.getElementById('player1').value = '';
    document.getElementById('player2').value = '';
    document.getElementById('player3').value = '';
    document.getElementById('player4').value = '';

    document.getElementById('bracket-player1').textContent = 'Player 1';
    document.getElementById('bracket-player2').textContent = 'Player 2';
    document.getElementById('bracket-player3').textContent = 'Player 3';
    document.getElementById('bracket-player4').textContent = 'Player 4';
  }
}
