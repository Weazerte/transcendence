import { Page } from '../../core/Page.js';
import { getUser, isLoggedIn, updateUser } from '../../services/user.js';

export class ProfilePage extends Page {
  constructor() {
    super('profile/index.html', 'profile/index.css');
  }

  async beforeMount() {
    await getUser();
    if (!isLoggedIn()) {
      globalThis.router.back();
      return false;
    }

    return true;
  }

  onMount() {
    this.setupEditProfile();
    this.renderProfilePicture();
    this.renderAlias();
    this.renderBio();

    // Gestionnaire pour le bouton "Voir mes stats"
    const viewStatsBtn = document.getElementById('view-stats-btn');
    if (viewStatsBtn) {
      viewStatsBtn.addEventListener('click', () => {
        if (globalThis.user && globalThis.user.id) {
          globalThis.router.navigate(`/profile/${globalThis.user.id}`);
        } else {
          console.error('Utilisateur non connecté ou ID manquant.');
          alert('Impossible de rediriger : utilisateur non connecté.');
        }
      });
    }

    document.addEventListener('userStateChange', () => {
      this.renderProfilePicture();
      this.renderAlias();
      this.renderBio();
    });
  }
  renderProfilePicture() {
    const profilePicture = document.querySelector('.profile__avatar-image');
    if (profilePicture && globalThis.user) {
      profilePicture.src = globalThis.user.avatar || 'static/images/avatars/duck.webp';
    }
  }

  renderAlias() {
    const alias = document.querySelector('.profile__alias');
    if (alias && globalThis.user) {
      alias.textContent = globalThis.user.nickname || 'Utilisateur inconnu';
    }
  }

  // Fonction pour afficher la bio de l'utilisateur
  renderBio() {
    const bio = document.querySelector('.profile__bio');
    if (bio && globalThis.user) {
      bio.textContent = globalThis.user.bio;
    }
  }

  // Fonction pour gérer l'édition du profil
  setupEditProfile() {
    const editBtn = document.querySelector('.profile__edit-btn');
    const editForm = document.querySelector('.profile__edit-form');
    const aliasInput = document.querySelector('.profile__edit-alias');
    const bioInput = document.querySelector('.profile__edit-bio');
    const avatarSelect = document.querySelector('.profile__edit-avatar');
    const saveBtn = document.querySelector('.profile__save-btn');
    const cancelBtn = document.querySelector('.profile__cancel-btn');

    if (globalThis.user) {
      aliasInput.value = globalThis.user.nickname || '';
      bioInput.value = globalThis.user.bio || '';
    }

    editBtn.addEventListener('click', () => {
      editForm.classList.remove('hidden');
    });

    cancelBtn.addEventListener('click', () => {
      editForm.classList.add('hidden');
    });

    saveBtn.addEventListener('click', async () => {
      try {
        const { error, ...user } = await updateUser({
          nickname: aliasInput.value,
          bio: bioInput.value,
          avatar: avatarSelect.files[0] || globalThis.user.avatar,
        });

        if (error) {
          alert(error);
          return;
        }

        aliasInput.value = user.nickname;
        bioInput.value = user.bio;
        avatarSelect.value = '';

        document.dispatchEvent(new Event('userStateChange'));
        editForm.classList.add('hidden');
      } catch (error) {
        console.error('Erreur lors de la mise à jour du profil :', error);
      }
    });
  }
}
