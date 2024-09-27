import { UrdUIService } from './UrdUIService';
import { UrdTimerService } from './UrdTimerService';
import { StorageService } from '../../services/StorageService';
import { MessageService } from '../../services/MessageService';
import { BrowserStorageService } from '../../services/BrowserStorageService';
import { WebPageMessageService } from '../../services/WebPageMessageService';

export class UrdTimer extends HTMLElement {
  private timerService: UrdTimerService;
  private uiService: UrdUIService;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    const storageService: StorageService = new BrowserStorageService();
    const messageService: MessageService = new WebPageMessageService();
    this.timerService = new UrdTimerService(storageService, messageService);
    this.uiService = new UrdUIService(this.shadowRoot, this.timerService);
    this.timerService.addObserver(this.uiService);
  }

  async connectedCallback() {
    try {
      await this.uiService.render();
      this.timerService.loadSettings();
      this.addEventListeners();
    } catch (error) {
      console.error('Error in connectedCallback:', error);
    }
  }

  private addEventListeners() {
    this.uiService.addButtonListeners(
      () => this.timerService.toggle(),
      () => this.timerService.reset()
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
