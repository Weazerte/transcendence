/**
 * component-i18n.js
 * A utility for translating dynamic component content
 */

import { t, getCurrentLanguage } from './i18n.js';

/**
 * TranslationMixin - A mixin that can be used with component classes to provide translation capabilities
 *
 * Usage:
 * 1. Import this mixin
 * 2. Apply it to your component class: MyComponent extends TranslationMixin(BaseClass) {}
 * 3. Use this.t('key') in your component methods
 */
const TranslationMixin = BaseClass =>
  class extends BaseClass {
    constructor(...args) {
      super(...args);

      // Listen for language changes
      document.addEventListener('languageChanged', () => {
        if (typeof this.updateTranslations === 'function') {
          this.updateTranslations();
        }
      });
    }

    // Translation helper
    t(key) {
      return t(key);
    }

    // Apply translations to an element's innerHTML, preserving any tags
    applyHTMLTranslation(element, key) {
      const template = element.getAttribute('data-i18n-template') || element.innerHTML;

      if (!element.hasAttribute('data-i18n-template')) {
        element.setAttribute('data-i18n-template', template);
      }

      // Replace all {{key}} patterns in the template
      element.innerHTML = template.replace(/\{\{([^}]+)\}\}/g, (match, translationKey) => {
        return t(translationKey);
      });
    }

    // Set a translated attribute
    setTranslatedAttr(element, attr, key) {
      element.setAttribute(attr, t(key));
    }
  };

/**
 * Simple function to translate a string or template
 * @param {string} template - A string with {{key}} placeholders
 * @returns {string} - Translated string
 */
const translateTemplate = template => {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    return t(key);
  });
};

export { TranslationMixin, translateTemplate };
