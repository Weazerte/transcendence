import { translatePage } from '../utils/i18n.js';

/**
 * Base class for all pages
 * @class
 * @classdesc Manages the template and rendering of pages
 */
export class Page {
  /**
   * Constructor for the Page class
   * @param {string} templatePath - The path to the template file
   */
  constructor(templatePath, stylePath) {
    this.templatePath = templatePath;
    this.stylePath = stylePath;
    this.style = null;
    this.template = null;
  }

  /**
   * Fetches the template HTML from the server
   * @returns {Promise<string>} The template HTML content
   * @private
   */
  async _fetchTemplate() {
    try {
      const response = await fetch(`/static/html/pages/${this.templatePath}`, {
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch template: ${response.statusText}`);
      }
      this.template = await response.text();
      return this.template;
    } catch (error) {
      console.error('Error fetching template:', error);
      throw error;
    }
  }

  async _fetchStyle() {
    if (!this.stylePath) return;

    try {
      const response = await fetch(`/static/css/pages/${this.stylePath}`, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Failed to fetch style: ${response.statusText}`);
      }
      this.style = await response.text();
      return this.style;
    } catch (error) {
      console.error('Error fetching style:', error);
      throw error;
    }
  }

  /**
   * Renders the template into the specified container
   * @param {HTMLElement} container - The container element to render the template into
   * @private
   */
  _render(container) {
    if (!container) {
      throw new Error('Container element is required for rendering');
    }
    container.innerHTML = this.template;

    container.appendChild(document.createElement('style')).textContent = this.style;

    // Apply translations to the newly rendered content
    translatePage();
  }

  /**
   * Mounts the page by fetching the template and performing any necessary setup
   * @param {HTMLElement} container - The container element to mount the page into
   * @returns {Promise<boolean>} Whether the mount was successful
   */
  async mount(container, params) {
    let shouldMount = await this.beforeMount(params);
    if (!shouldMount) {
      return false;
    }

    try {
      await this._fetchTemplate();

      await this._fetchStyle();

      this._render(container);
      await this.onMount(params);
      translatePage();
      return true;
    } catch (error) {
      console.error('Error mounting page:', error);
      return false;
    }
  }

  /**
   * Called before the page is mounted
   *
   * @param {Object} params - The parameters to pass to the page
   * @returns {Promise<boolean>} Whether the page should be mounted
   */
  async beforeMount() {
    // Override in subclasses to add custom behavior
    return true;
  }

  async onMount() {
    // Override in subclasses to add custom behavior
  }
}
