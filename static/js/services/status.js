import { getAccessToken } from './token.js';

/**
 * The status socket
 * @type {WebSocket}
 */
globalThis.statusSocket = null;

/**
 * Update the user status
 */
export function connectToStatusSocket() {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return;
  }

  const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
  const wsUrl = `${wsProtocol}${window.location.host}/ws/user/status`;

  globalThis.statusSocket = new WebSocket(wsUrl);

  // Handle incoming messages
  globalThis.statusSocket.onmessage = event => {
    const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

    if (data.type === 'status_change') {
      // Update the UI for the user's status change
      updateFriendStatus(data.user_id, data.status, data.nickname);

      document.dispatchEvent(
        new CustomEvent('userStatusChange', {
          detail: { userId: data.user_id, status: data.status, nickname: data.nickname },
        })
      );
    }
  };
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
 * Update the UI to reflect a user's status change
 * @param {number} userId - The ID of the user whose status changed
 * @param {string} status - The new status (online/offline)
 * @param {string} nickname - The user's nickname
 */
function updateFriendStatus(userId, status, nickname) {
  // Find all elements that display this user's status
  const friendElements = document.querySelectorAll(`.userlist__item[data-user-id="${userId}"]`);

  friendElements.forEach(element => {
    // Update status icon
    const statusIcon = element.querySelector('.userlist__item-icon');
    if (statusIcon) {
      statusIcon.src = `/static/images/icons/user-${status}.png`;
    }
  });
}
