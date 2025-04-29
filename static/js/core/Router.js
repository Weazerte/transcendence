import { NotFoundPage } from '../pages/not-found.js';

/**
 * Router class
 * @class
 * @classdesc Manages navigation between pages
 */
export class Router {
  pages = {};
  dynamicRoutes = []; // Ajout pour stocker les routes dynamiques

  /**
   * Constructor for the Router class
   * @param {HTMLElement} rootElement - The root element
   */
  constructor(rootElement) {
    this.rootElement = rootElement;
    this._init();
  }

  /**
   * Initializes the router by adding a popstate event listener and handling the initial route
   * @private
   */
  _init() {
    window.addEventListener('DOMContentLoaded', () => {
      this._populateNavigationLinks();
      this._observeDOMChanges();
      // Handle the initial route
      this._handleRoute();
    });
    window.addEventListener('popstate', async () => {
      document.dispatchEvent(new Event('routeChange'));
      // Handle route changes when the user navigates back/forward
      this._handleRoute();
    });
  }

  /**
   * Observes DOM changes to handle dynamically added navigation links
   * @private
   */
  _observeDOMChanges() {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            // Check if the added node is an element
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Handle direct <a> elements
              if (node.tagName === 'A' && node.hasAttribute('href')) {
                this._addNavigationHandler(node);
              }
              // Handle any <a> elements within the added node
              const links = node.querySelectorAll('a[href]');
              links.forEach(link => this._addNavigationHandler(link));
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * Adds click event listener to a single navigation link
   * @private
   * @param {HTMLAnchorElement} link - The link element to add handler to
   */
  _addNavigationHandler(link) {
    link.addEventListener('click', event => {
      event.preventDefault();
      this.navigate(link.getAttribute('href'));
    });
  }

  /**
   * Adds click event listeners to all navigation links to handle routing
   * internally rather than triggering full page reloads
   * @private
   */
  _populateNavigationLinks() {
    const navigationLinks = document.querySelectorAll('a[href]');
    navigationLinks.forEach(link => this._addNavigationHandler(link));
  }

  /**
   * Converts a route pattern with params (e.g. '/users/:id') to a regex pattern
   * @private
   * @param {string} route - The route pattern
   * @returns {object} Object containing regex pattern and param names
   */
  _createRoutePattern(route) {
    const paramNames = [];
    const pattern = route.replace(/:[a-zA-Z]+/g, match => {
      paramNames.push(match.slice(1));
      return '([^/]+)';
    });
    return {
      regex: new RegExp(`^${pattern}$`),
      paramNames,
    };
  }

  /**
   * Handles the route change by updating the main content and mounting the appropriate page
   * @private
   */
  async _handleRoute() {
    const currentPath = location.pathname;
    let matchedPage = null;
    let params = {};

    // Check for exact matches first
    if (this.pages[currentPath]) {
      matchedPage = this.pages[currentPath];
    } else {
      // Check for parameterized routes
      for (const [route, page] of Object.entries(this.pages)) {
        if (route.includes(':')) {
          const { regex, paramNames } = this._createRoutePattern(route);
          const match = currentPath.match(regex);

          if (match) {
            matchedPage = page;
            // Extract params from the URL
            paramNames.forEach((name, index) => {
              params[name] = match[index + 1];
            });
            break;
          }
        }
      }
    }

    console.log('Handling route:', currentPath, 'with params:', params);

    if (matchedPage) {
      await matchedPage.mount(this.rootElement, params);
    } else {
      const notFoundPage = new NotFoundPage();
      await notFoundPage.mount(this.rootElement);
    }
  }

  /**
   * Navigates to the specified route
   * @param {string} route - The route to navigate to
   */
  navigate(route) {
    const previousRoute = location.pathname;
    console.log(`(${this.constructor.name}) Navigating from ${previousRoute} to ${route}`);
    history.pushState({}, '', route);
    this._handleRoute();

    document.dispatchEvent(new Event('routeChange'));
  }

  /**
   * Navigates back to the previous route
   */
  back() {
    history.back();

    document.dispatchEvent(new Event('routeChange'));
  }

  /**
   * Registers a new static route with its corresponding page instance
   * @param {string} route - The route path to register
   * @param {object} pageInstance - The page instance to associate with the route
   * @throws {Error} If the route is already registered
   */
  registerRoute(route, pageInstance) {
    if (this.pages[route]) {
      throw new Error(`Route "${route}" is already registered`);
    }
    this.pages[route] = pageInstance;
  }
}
