import { Router } from './core/Router.js';
import { GamePage } from './pages/game.js';
import { ProfilePage } from './pages/profile/index.js';
import { UserProfilePage } from './pages/profile/id.js';
import { getUser } from './services/user.js';
import { DirectMessagePage } from './pages/chat/id.js';
import { apiFetch } from './services/token.js';
import { FakeSignInPage } from './pages/dev/fake-signin.js';
import { LocalGamePage } from './pages/local-game.js';
import { connectToStatusSocket } from './services/status.js';
import { translatePage } from './utils/i18n.js';
import './components/language-selector.js';
import { TournamentPage } from './pages/tournament.js';
import { WelcomePage } from './pages/welcome.js'

// Initialize the router in globalThis
// so it can be accessed from anywhere in the code
globalThis.router = null;

document.addEventListener('DOMContentLoaded', async () => {
  const rootElement = document.getElementById('page');
  const router = new Router(rootElement);

  // Register the routes
  router.registerRoute('/', new WelcomePage());
  router.registerRoute('/game', new GamePage());
  router.registerRoute('/profile', new ProfilePage());
  router.registerRoute('/profile/:id', new UserProfilePage());
  router.registerRoute('/chat/:id', new DirectMessagePage());
  router.registerRoute('/dev/fake-signin', new FakeSignInPage());
  router.registerRoute('/local-game', new LocalGamePage());
  router.registerRoute('/tournament', new TournamentPage());

  globalThis.router = router;

  getUser();
  connectToStatusSocket();
  translatePage();
});

// Store the original fetch function
globalThis.originalFetch = globalThis.fetch;

// Override the global fetch function
globalThis.fetch = function (url, options = {}) {
  // Skip token refresh for auth endpoints
  if (url.includes('/api/auth/')) {
    return globalThis.originalFetch(url, options);
  }

  return apiFetch(url, options);
};
