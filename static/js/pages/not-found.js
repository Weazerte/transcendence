import { Page } from '../core/Page.js';

export class NotFoundPage extends Page {
  constructor() {
    super('not-found.html', 'not-found.css');
  }

  onMount() {
    console.log('Not Found Page mounted');
  }
}
