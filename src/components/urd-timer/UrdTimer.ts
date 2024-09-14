import { UrdUIService } from './UrdUIService';
import { UrdTimerService } from './UrdTimerService';

export class UrdTimer extends HTMLElement {
  private urdTimerService: UrdTimerService;
  private urdUIService: UrdUIService;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.urdTimerService = new UrdTimerService();
    this.urdUIService = new UrdUIService(this.shadowRoot, this.urdTimerService);
    this.urdTimerService.addObserver(this.urdUIService);
  }

  async connectedCallback() {
    try {
      await this.urdUIService.render();
      this.urdTimerService.loadSettings();
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

    const saveSettingsButton = this.shadowRoot?.querySelector('#save-settings');
    saveSettingsButton?.addEventListener('click', () => {
      const workDuration = this.getInputValue('#work-duration', 25);
      const shortBreakDuration = this.getInputValue('#short-break-duration', 5);
      const longBreakDuration = this.getInputValue('#long-break-duration', 15);
      this.urdTimerService.updateSettings(workDuration, shortBreakDuration, longBreakDuration);
    });
  }

  private getInputValue(selector: string, defaultValue: number): number {
    const input = this.shadowRoot?.querySelector(selector) as HTMLInputElement;
    return input ? parseInt(input.value, 10) || defaultValue : defaultValue;
  }
}

if (!customElements.get('urd-timer')) {
  customElements.define('urd-timer', UrdTimer);
}
