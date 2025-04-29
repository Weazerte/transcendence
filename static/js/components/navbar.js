import { isLoggedIn, signOut } from '../services/user.js';

document.addEventListener('DOMContentLoaded', () => {
  const signInButton = document.querySelector('.navbar #sign-in');
  const signOutButton = document.querySelector('.navbar #sign-out');

  signInButton.addEventListener('click', handleSignInClick);
  signOutButton.addEventListener('click', handleSignOutClick);

  refreshNavbar();
});

document.addEventListener('userStateChange', () => {
  refreshNavbar();
});

function refreshNavbar() {
  const signInButton = document.querySelector('.navbar #sign-in');
  const signOutButton = document.querySelector('.navbar #sign-out');
  const profileLink = document.querySelector('.navbar #profile-link');

  if (isLoggedIn()) {
    signInButton.style.display = 'none';
    signOutButton.style.display = 'flex';
    profileLink.style.display = 'flex';
  } else {
    signInButton.style.display = 'flex';
    signOutButton.style.display = 'none';
    profileLink.style.display = 'none';
  }
}

function handleSignInClick() {
  fetch('/api/auth/42/authorize/')
    .then(response => response.json())
    .then(data => {
      window.location.href = data.redirect_url; // Redirige l'utilisateur
    })
    .catch(error => console.error("Erreur d'authentification :", error));
}

function handleSignOutClick() {
  signOut();
}
