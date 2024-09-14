import { UrdUIService } from './UrdUIService';
import { UrdTimerService } from './UrdTimerService';

export class UrdTimer extends HTMLElement {
  private urdUIService: UrdUIService;
  private urdTimerService: UrdTimerService;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.urdTimerService = new UrdTimerService();
    this.urdUIService = new UrdUIService(this.shadowRoot);
    this.urdTimerService.addObserver(this.urdUIService);
  }

  async connectedCallback() {
    try {
      await this.urdUIService.render();
      this.addEventListeners();
    } catch (error) {
      console.error('Error in connectedCallback:', error);
    }
  }

  private addEventListeners() {
    this.urdUIService.addButtonListeners(
      () => this.urdTimerService.toggle(),
      () => this.urdTimerService.reset()
    );
  }
}

if (!customElements.get('urd-timer')) {
  customElements.define('urd-timer', UrdTimer);
}
