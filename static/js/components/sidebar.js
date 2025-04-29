import {setupAddFriendForm, populateFriendsList} from '../services/user.js'

document.addEventListener('DOMContentLoaded', () => {
  populateFriendsList();
  setupAddFriendForm();
});

document.addEventListener('userStateChange', () => {
  populateFriendsList();
});
