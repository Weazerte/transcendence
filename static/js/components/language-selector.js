import { AVAILABLE_LANGUAGES, getCurrentLanguage, setLanguage, t } from '../utils/i18n.js';

/**
 * Language Selector Component
 * Provides UI for switching between available languages
 */
class LanguageSelector {
  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'language-selector';
    this.render();

    // Listen for language changes
    document.addEventListener('languageChanged', () => this.updateSelectedLanguage());
  }

  render() {
    const currentLang = getCurrentLanguage();

    this.element.innerHTML = `
      <div class="language-selector__dropdown">
        <button class="language-selector__current">
          ${t(`language.${currentLang}`)}
          <span class="language-selector__arrow">▼</span>
        </button>
        <div class="language-selector__options">
          ${AVAILABLE_LANGUAGES.map(
            lang => `
            <button class="language-selector__option ${
              lang === currentLang ? 'language-selector__option--active' : ''
            }" 
                    data-lang="${lang}">
              ${t(`language.${lang}`)}
            </button>
          `
          ).join('')}
        </div>
      </div>
    `;

    // Add event listeners
    const dropdown = this.element.querySelector('.language-selector__current');
    dropdown.addEventListener('click', e => {
      e.stopPropagation();
      this.element
        .querySelector('.language-selector__options')
        .classList.toggle('language-selector__options--open');
    });

    // Add click event for language options
    this.element.querySelectorAll('.language-selector__option').forEach(option => {
      option.addEventListener('click', e => {
        e.stopPropagation();
        const lang = option.getAttribute('data-lang');
        setLanguage(lang);
        this.element
          .querySelector('.language-selector__options')
          .classList.remove('language-selector__options--open');
      });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
      this.element
        .querySelector('.language-selector__options')
        .classList.remove('language-selector__options--open');
    });
  }

  updateSelectedLanguage() {
    const currentLang = getCurrentLanguage();

    // Update the current language button text
    const currentButton = this.element.querySelector('.language-selector__current');
    currentButton.textContent = t(`language.${currentLang}`);
    currentButton.appendChild(document.createElement('span'));
    currentButton.lastChild.className = 'language-selector__arrow';
    currentButton.lastChild.textContent = '▼';

    // Update the active option
    this.element.querySelectorAll('.language-selector__option').forEach(option => {
      const lang = option.getAttribute('data-lang');
      option.textContent = t(`language.${lang}`);

      if (lang === currentLang) {
        option.classList.add('language-selector__option--active');
      } else {
        option.classList.remove('language-selector__option--active');
      }
    });
  }
}

// Initialize and append the language selector to the navbar
document.addEventListener('DOMContentLoaded', () => {
  const languageSelector = new LanguageSelector();
  const navbar = document.querySelector('.navbar__group:last-child');

  if (navbar) {
    // Create a container for the language selector that matches navbar styling
    const container = document.createElement('div');
    container.className = 'navbar__item navbar__item--language';
    container.appendChild(languageSelector.element);

    // Insert before the last item (sign in/out buttons)
    navbar.insertBefore(container, navbar.lastChild);
  }
});

export { LanguageSelector };
