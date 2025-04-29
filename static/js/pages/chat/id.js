import { Page } from '../../core/Page.js';
import { getCookie } from '../../utils/cookies.js';

export class DirectMessagePage extends Page {
  /**
   * The other user to chat with
   *
   * @type {Object}
   */
  otherUser;

  constructor() {
    super('chat/id.html', 'chat/id.css');
  }

  async beforeMount(params) {
    try {
      await this._loadUser(params.id);
    } catch (error) {
      globalThis.router.back();
      return false;
    }

    return true;
  }

  async onMount() {
    document.querySelector('#chat-form').addEventListener('submit', this._onSubmitInput.bind(this));
    document
      .querySelector('#block-button')
      .addEventListener('click', this._handleBlockUser.bind(this));
    document
      .querySelector('#unblock-button')
      .addEventListener('click', this._handleUnblockUser.bind(this));
    document
      .querySelector('#invite-button')
      .addEventListener('click', this._handleInviteUser.bind(this));

    document.querySelector('#chat-username').textContent = this.otherUser.nickname;
    document.querySelector('#chat-username').href = `/profile/${this.otherUser.id}`;

    if (this.otherUser.avatar) {
      document.querySelector('#chat-avatar').src = this.otherUser.avatar;
    }

    try {
      await this._loadBlockedStatus();
      await this._loadExistingMessages();
      await this._connectToWebSocket();
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }

  /**
   * Load the other user to chat with
   * @private
   *
   * @param {string} id - The id of the other user
   */
  async _loadUser(id) {
    const response = await fetch(`/api/user/${id}/`, {
      headers: {
        Authorization: `Bearer ${getCookie('access_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to load user');
    }

    this.otherUser = await response.json();
  }

  /**
   * Load the blocked status of the other user
   * @private
   *
   * @returns {Promise<void>}
   */
  async _loadBlockedStatus() {
    const response = await fetch(`/api/chat/messages/${this.otherUser.id}/is_blocked/`, {
      headers: {
        Authorization: `Bearer ${getCookie('access_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to check if user is blocked');
    }

    const data = await response.json();

    this._showBlockButton(!data.blocked);
  }

  /**
   * Connect to the web socket
   * @private
   *
   * @returns {Promise<WebSocket>}
   */
  async _connectToWebSocket() {
    return new Promise((resolve, reject) => {
      if (this.socket) {
        this.socket.close();
      }

      this.socket = new WebSocket(
        `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${
          window.location.host
        }/ws/chat/${this.otherUser.id}/`
      );

      this.socket.onmessage = this._onReceiveMessage.bind(this);

      this.socket.onopen = () => {
        console.log('WebSocket connection opened');
        resolve(this.socket);
      };

      this.socket.onclose = event => {
        console.log('WebSocket connection closed', event);
        reject(new Error('WebSocket connection closed'));
      };

      this.socket.onerror = error => {
        console.error('WebSocket error:', error);
        reject(error);
      };
    });
  }

  /**
   * Load the existing messages
   * @private
   *
   * @returns {Promise<void>}
   * @throws {Error} If the response is not ok
   */
  async _loadExistingMessages() {
    const response = await fetch(`/api/chat/messages/${this.otherUser.id}`, {
      headers: {
        Authorization: `Bearer ${getCookie('access_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to load messages');
    }

    const messages = await response.json();
    messages.forEach(message => {
      this._addMessageToChat({
        message: message.content,
        sender_id: message.sender.id,
        timestamp: message.timestamp,
        embeds: message.embeds,
      });
    });
  }

  /**
   * Update the chat block status, this will show or hide the block button and the blocked message
   * @private
   *
   * @param {boolean} show - Whether to show the block button
   */
  _showBlockButton(show) {
    const blockButton = document.querySelector('#block-button');
    const unblockButton = document.querySelector('#unblock-button');

    if (show) {
      blockButton.style.display = 'flex';
      unblockButton.style.display = 'none';
    } else {
      blockButton.style.display = 'none';
      unblockButton.style.display = 'flex';
    }
  }

  /**
   * Set the form error
   * @private
   *
   * @param {string} reason - The reason for the error
   */
  _setFormError(reason) {
    const formError = document.querySelector('#chat-form-error');
    if (!formError) {
      return;
    }

    formError.textContent = reason;
    formError.style.display = 'block';
  }

  /**
   * Clear the form error
   * @private
   */
  _clearFormError() {
    const formError = document.querySelector('#chat-form-error');
    if (!formError) {
      return;
    }

    formError.textContent = '';
    formError.style.display = 'none';
  }

  /**
   * Block the other user
   * @private
   *
   * @returns {Promise<void>}
   */
  async _handleBlockUser() {
    try {
      const response = await fetch(`/api/chat/messages/${this.otherUser.id}/block_user/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getCookie('access_token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to block user');

      this._showBlockButton(false);
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  }

  /**
   * Unblock the other user
   * @private
   *
   * @returns {Promise<void>}
   */
  async _handleUnblockUser() {
    try {
      const response = await fetch(`/api/chat/messages/${this.otherUser.id}/unblock_user/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getCookie('access_token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to unblock user');

      this._showBlockButton(true);
    } catch (error) {
      console.error('Error unblocking user:', error);
    }
  }

  /**
   * Invite the other user to a 1v1 pong game
   * @private
   */
  async _handleInviteUser() {
    try {
      const response = await fetch(`/api/game/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getCookie('access_token')}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to invite user to game');
      const data = await response.json();
      const gameId = data.game_id;

      // Send game invite message with clickable link
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(
          JSON.stringify({
            message: `I'm inviting you to play Pong!`,
            embeds: [
              {
                type: 'game_invite',
                url: `/game?joinGame=${gameId}`,
              },
            ],
          })
        );
      }

      // Navigate to the waiting screen
      globalThis.router.navigate(`/game?waitingGame=${gameId}`);
    } catch (error) {
      console.error('Error inviting user:', error);
      this._setFormError('Failed to invite user to game, please try again');
    }
  }

  /**
   * Add a message to the chat
   * @private
   *
   * @param {Object} data - The message data
   * @param {string} data.message - The message content
   * @param {number} data.sender_id - The id of the sender
   * @param {string} data.timestamp - The timestamp of the message
   * @param {Array} [data.embeds] - Optional embeds for the message
   */
  _addMessageToChat(data) {
    const messagesContainer = document.querySelector('#chat-messages');
    if (!messagesContainer) {
      return;
    }

    const messageContainer = document.createElement('div');
    messageContainer.classList.add('chat__message');

    // If the message is sent by the user, add the sent class
    if (data.sender_id === globalThis.user.id) {
      messageContainer.classList.add('chat__message--sent');
    } else {
      messageContainer.classList.add('chat__message--received');
    }

    const messageContent = document.createElement('div');
    messageContent.classList.add('chat__message-content');

    const messageText = document.createElement('div');
    messageText.classList.add('chat__message-text');
    messageText.textContent = data.message;
    messageContent.appendChild(messageText);

    const embeds = data.embeds ?? [];

    // Process each embed
    embeds.forEach(embed => {
      switch (embed.type) {
        case 'game_invite':
          if (data.sender_id === globalThis.user.id) {
            return;
          }
          // For game invites or other clickable embeds
          const gameInvite = document.createElement('a');
          gameInvite.href = embed.url;
          gameInvite.classList.add('chat__message-game-invite');
          gameInvite.textContent = 'Join Game';

          messageContent.appendChild(gameInvite);
          break;
      }
    });

    const messageTime = document.createElement('div');
    messageTime.classList.add('chat__message-time');
    messageTime.textContent = data.timestamp
      ? new Date(data.timestamp).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      : new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
    messageContent.appendChild(messageTime);

    messageContainer.appendChild(messageContent);

    messagesContainer.appendChild(messageContainer);

    messageContainer.scrollIntoView({ behavior: 'smooth' });
  }

  /**
   * Receive a message from the web socket
   * @private
   *
   * @param {Object} e - The event object
   * @param {Object} e.data - The data object
   * @param {string} e.data.type - The type of message (error, message)
   * @param {string} [e.data.error] - The error message
   * @param {string} [e.data.code] - The error code (UNAUTHORIZED, INVALID_MESSAGE, etc.)
   * @param {string} [e.data.message] - The message
   * @param {number} [e.data.sender_id] - The id of the sender
   * @param {string} [e.data.timestamp] - The timestamp of the message
   * @param {Array} [e.data.embeds] - Optional embeds for the message
   */
  _onReceiveMessage(e) {
    const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
    if (!data) return;

    if (data.type === 'message') {
      // If the message is sent by the other user, add it to the chat
      this._addMessageToChat(data);
      this._clearFormError();
    } else if (data.type === 'error') {
      // If the message occurred an error, show the error
      this._setFormError(data.error);
    } else {
      console.error('Unknown message type:', data);
    }
  }

  /**
   * Submit a message
   * @private
   *
   * @param {Event} e - The event object
   */
  async _onSubmitInput(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const message = formData.get('message');

    try {
      if (this.socket.readyState !== WebSocket.OPEN) {
        throw new Error('Connection is not open');
      }

      this.socket.send(
        JSON.stringify({
          message: message,
        })
      );
    } catch (error) {
      console.error('Error sending message:', error);

      this._setFormError('Failed to send message, please try again');
    } finally {
      e.target.reset();
    }
  }
}
