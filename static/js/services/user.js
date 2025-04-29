import { getAccessToken, clearTokens } from './token.js';
import { getCookie } from '../utils/cookies.js';

/*
 * Global variable to store the user data
 * so that it can be accessed from anywhere
 *
 * @type {Object | null}
 */
globalThis.user = null;

/**
 * Get the user data from the server
 *
 * @returns {Promise<Object>}
 */
export async function getUser() {
  const accessToken = getAccessToken();
  if (!accessToken) {
    globalThis.user = null;
    document.dispatchEvent(new CustomEvent('userStateChange', { detail: globalThis.user }));
    return;
  }

  const response = await fetch('/api/user/me/', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // If the user is not connected, set the user to null and dispatch an event
  if (!response.ok) {
    globalThis.user = null;
    document.dispatchEvent(new CustomEvent('userStateChange', { detail: globalThis.user }));
    return null;
  }

  const data = await response.json();
  globalThis.user = data;
  document.dispatchEvent(new CustomEvent('userStateChange', { detail: globalThis.user }));

  return data;
}

/**
 * Disconnect from the status socket
 */
export function disconnectFromStatusSocket() {
  if (globalThis.statusSocket) {
    globalThis.statusSocket.close();
  }
}

/**
 * Check if the user is logged in
 *
 * @returns {boolean}
 */
export function isLoggedIn() {
  return globalThis.user !== null;
}

/**
 * Sign out the user
 */
export function signOut() {
  // Clear the tokens
  clearTokens();

  // Reset user state
  globalThis.user = null;

  document.dispatchEvent(new CustomEvent('userStateChange', { detail: globalThis.user }));
  document.dispatchEvent(new CustomEvent('signOut'));

  // Redirect to the home page
  globalThis.router.navigate('/');

  // Close the status socket
  disconnectFromStatusSocket();

  // Refresh the friends list
  populateFriendsList();
}

/**
 * Update the user
 *
 * @param {Object} data
 * @param {string} data.nickname
 * @param {string} data.bio
 * @param {File} data.avatar
 */
export async function updateUser(data) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return;
  }

  const formData = new FormData();
  formData.append('nickname', data.nickname);
  formData.append('bio', data.bio);
  if (data.avatar instanceof File) {
    formData.append('avatar', data.avatar);
  }

  const response = await fetch('/api/user/me/', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  const responseData = await response.json();

  if (!response.ok) {
    if (response.status === 400) {
      const errorMessages = {};

      for (const [field, errors] of Object.entries(responseData)) {
        if (Array.isArray(errors)) {
          errorMessages[field] = errors.join(', ');
        } else if (typeof errors === 'string') {
          errorMessages[field] = errors;
        }
      }

      return {
        error:
          errorMessages.non_field_errors ||
          errorMessages.nickname ||
          errorMessages.bio ||
          errorMessages.avatar ||
          'Validation error occurred',
      };
    }

    return { error: responseData.detail || 'Failed to update profile' };
  }

  globalThis.user = responseData;
  document.dispatchEvent(new CustomEvent('userStateChange', { detail: globalThis.user }));

  return responseData;
}

export function setupAddFriendForm() {
  // Add the HTML form for adding friends
  const userlistHeader = document.querySelector('.userlist__header');

  const userlistTitle = userlistHeader.querySelector('.userlist__title');
  if (userlistTitle) {
    userlistTitle.textContent = 'Friends';
  }

  if (userlistHeader) {
    // Create add friend button that will toggle the form visibility
    const addFriendButton = document.createElement('button');
    addFriendButton.classList.add('userlist__add-friend-btn');
    addFriendButton.textContent = '+'; // Simple + instead of Font Awesome icon
    addFriendButton.title = 'Add Friend';
    userlistHeader.appendChild(addFriendButton);

    // Create the form container
    const formContainer = document.createElement('div');
    formContainer.classList.add('userlist__add-friend-form');
    formContainer.style.display = 'none';
    formContainer.innerHTML = `
      <input type="text" class="userlist__add-friend-input" placeholder="Username" />
      <button type="button" class="userlist__add-friend-submit">Add</button>
      <div class="userlist__add-friend-message"></div>
    `;

    // Insert the form after the header
    userlistHeader.parentNode.insertBefore(formContainer, userlistHeader.nextSibling);

    // Toggle form visibility when clicking the add friend button
    addFriendButton.addEventListener('click', () => {
      formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
      if (formContainer.style.display === 'block') {
        formContainer.querySelector('.userlist__add-friend-input').focus();
      }
    });

    // Handle form submission
    const submitButton = formContainer.querySelector('.userlist__add-friend-submit');
    submitButton.addEventListener('click', handleAddFriend);

    // Allow pressing Enter to submit
    const input = formContainer.querySelector('.userlist__add-friend-input');
    input.addEventListener('keypress', event => {
      if (event.key === 'Enter') {
        handleAddFriend();
      }
    });
  }
}

async function handleAddFriend() {
  const input = document.querySelector('.userlist__add-friend-input');
  const messageDisplay = document.querySelector('.userlist__add-friend-message');
  const username = input.value.trim();

  if (!username) {
    showAddFriendMessage('Please enter a username', 'error');
    return;
  }

  try {
    const accessToken = getCookie('access_token');
    if (!accessToken) {
      showAddFriendMessage('You must be logged in', 'error');
      return;
    }

    const response = await fetch('/api/user/friend/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }),
    });

    const data = await response.json();

    if (response.ok) {
      showAddFriendMessage(data.message, 'success');
      input.value = '';
      // Refresh the friends list
      populateFriendsList();
    } else {
      showAddFriendMessage(data.error, 'error');
    }
  } catch (error) {
    showAddFriendMessage('An error occurred. Please try again.', 'error');
    console.error('Error adding friend:', error);
  }
}

function showAddFriendMessage(message, type) {
  const messageDisplay = document.querySelector('.userlist__add-friend-message');
  messageDisplay.textContent = message;
  messageDisplay.className = 'userlist__add-friend-message';
  messageDisplay.classList.add(`userlist__add-friend-message--${type}`);
  messageDisplay.style.display = 'block';

  // Hide the message after 3 seconds
  setTimeout(() => {
    messageDisplay.style.display = 'none';
  }, 3000);
}

export async function populateFriendsList() {
  const userListContainer = document.querySelector('.userlist__content');
  if (userListContainer) {
    userListContainer.innerHTML = ''; // Clear the list before filling it
  }

  const accessToken = getCookie('access_token');
  if (!accessToken) {
    return;
  }

  const response = await fetch('/api/user/friends/', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) throw new Error('Failed to retrieve friends list');

  const friends = await response.json();

  if (userListContainer) {
    userListContainer.innerHTML = ''; // Clear the list before filling it

    // If the user has no friends, display a message
    if (friends.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.classList.add('userlist__empty');
      emptyMessage.textContent = 'No friends yet';
      userListContainer.appendChild(emptyMessage);
      return;
    }

    // Create a list item for each friend
    friends.forEach(friend => {
      const userItem = document.createElement('a');
      userItem.classList.add('userlist__item');
      userItem.setAttribute('data-user-id', friend.id);
      userItem.href = `/profile/${friend.id}`;

      userItem.innerHTML = `
        <img src="/static/images/icons/user-${friend.status}.png" class="userlist__item-icon" />
        <span class="userlist__name">${friend.nickname || friend.username}</span>
    `;

      userListContainer.appendChild(userItem);
    });
  }
}
