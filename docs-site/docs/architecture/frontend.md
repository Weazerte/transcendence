# Frontend Architecture

The frontend is a custom Single Page Application (SPA) built with vanilla JavaScript.

## Core Components

Located in `static/js/core/`:

- **Router.js**: Handles client-side routing

    - Manages navigation between pages
    - Updates URL without page reloads
    - Handles browser history

- **Page.js**: Base class for all pages

    - Loads HTML templates
    - Manages page lifecycle
    - Provides common functionality

## Page Structure

Each page follows this structure:

- **HTML Template**: `static/html/pages/<page-name>.html`
- **CSS Styles**: `static/css/pages/<page-name>.css`
- **JavaScript Class**: `static/js/pages/<page-name>.js`

## Routing System

The routing system works as follows:

1. All requests are directed to the index view by Django's catch-all route
2. The JavaScript router intercepts link clicks
3. The router loads the appropriate page component
4. The page component loads its template and renders it

## Static Files

Static files are organized as follows:

- **CSS**: `static/css/`
- **JavaScript**: `static/js/`
- **Images**: `static/images/`
- **HTML Templates**: `static/html/`

All static files are served from the `/static/` URL path.

### Example

```html
<link rel="stylesheet" href="/static/css/style.css">
<script src="/static/js/script.js"></script>
<img src="/static/images/logo.png" alt="Logo">
```