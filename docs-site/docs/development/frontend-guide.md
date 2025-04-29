# Frontend Development Guide

## SPA Architecture

The frontend is a custom Single Page Application (SPA) that uses:

- Vanilla JavaScript (no frameworks)
- Client-side routing
- HTML templates
- CSS for styling

## Page Structure

Each page in the SPA follows this structure:

1. Create an HTML template in `static/html/pages/your-page.html`

2. Create a CSS file in `static/css/pages/your-page.css`

3. Create a JavaScript class in `static/js/pages/your-page.js`:
  ```javascript
  import { Page } from '../core/Page.js';

  export class YourPage extends Page {
    constructor() {
      // Pass the HTML template and CSS file names
      super('your-page.html', 'your-page.css');
    }

    // This method is called when the page is mounted
    onMount() {
      console.log('Your Page mounted');
      // Initialize page-specific functionality
      this.setupEventListeners();
    }

    setupEventListeners() {
      // Add event listeners to elements on the page
      const button = document.getElementById('your-button');
      button.addEventListener('click', this.handleButtonClick.bind(this));
    }

    handleButtonClick() {
      console.log('Button clicked');
      // Handle the button click
    }
  }
  ```

4. Register the page with the router in `static/js/app.js`:
  ```javascript
  import { YourPage } from './pages/your-page.js';

  // Inside the DOMContentLoaded event listener
  router.registerRoute('/your-page', new YourPage());
  ```

## Navigation

To navigate between pages:

```javascript
// Navigate to a different page
globalThis.router.navigate('/your-page');
```

## API Requests

To make API requests:

```javascript
async function fetchData() {
  try {
    const response = await fetch('/api/your-endpoint/');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}
```