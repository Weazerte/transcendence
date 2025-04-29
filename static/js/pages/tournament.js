import { Page } from '../core/Page.js';
import { Tournament } from '../components/tournament.js';

export class TournamentPage extends Page {
  constructor() {
    super('tournament.html', 'tournament.css');
    this.tournamentInstance = null;
  }

  onMount() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.getElementById('back-to-menu').addEventListener('click', () => {
      window.router.navigate('/');
    });

    document.getElementById('create-tournament').addEventListener('click', () => {
      document.getElementById('tournament-menu').style.display = 'none';
      document.getElementById('player-registration').style.display = 'block';
    });

    document.getElementById('start-tournament').addEventListener('click', () => {
      const player1 = document.getElementById('player1').value.trim();
      const player2 = document.getElementById('player2').value.trim();
      const player3 = document.getElementById('player3').value.trim();
      const player4 = document.getElementById('player4').value.trim();

      if (player1 && player2 && player3 && player4) {
        this.tournamentInstance = new Tournament(player1, player2, player3, player4);
        this.tournamentInstance.startMatch();
      } else {
        alert("All players must have names!");
      }
    });

    document.getElementById('back-to-tournament-menu').addEventListener('click', () => {
      document.getElementById('player-registration').style.display = 'none';
      document.getElementById('tournament-menu').style.display = 'block';
    });
  }

}