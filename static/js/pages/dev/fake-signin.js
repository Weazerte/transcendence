import { Page } from '../../core/Page.js';
import { getUser } from '../../services/user.js';

export class FakeSignInPage extends Page {
  constructor() {
    super('dev/fake-signin.html', 'dev/fake-signin.css');
  }

  onMount() {
    const fakeSignInButton = document.querySelector('#fake-signin');
    fakeSignInButton.addEventListener('click', this.handleFakeSignInClick.bind(this));
  }

  async handleFakeSignInClick() {
    const username = document.querySelector('#username').value;

    if (!username) {
      alert('Please enter a username');
      return;
    }

    const response = await fetch('/api/auth/fake-signin/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: username }),
    });

    if (response.ok) {
      await getUser();
    } else {
      alert('Failed to sign in');
    }
  }
}
