import { UrdUIService } from './UrdUIService';
import { UrdTimerService } from './UrdTimerService';
import { StorageService } from '../../services/StorageService';
import { MessageService } from '../../services/MessageService';
import { BrowserStorageService } from '../../services/BrowserStorageService';
import { WebPageMessageService } from '../../services/WebPageMessageService';
import { UrdUIRenderer } from './UrdUIRenderer';
import { UrdUIDOMHandler } from './UrdUIDOMHandler';
import { UrdSettingsManager } from './UrdSettingsManager';

export class UrdTimer extends HTMLElement {
  private timerService: UrdTimerService;
  private uiService: UrdUIService;

  constructor(
    storageService: StorageService = new BrowserStorageService(),
    messageService: MessageService = new WebPageMessageService()
  ) {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    const settingsManager = new UrdSettingsManager(storageService);
    this.timerService = new UrdTimerService(settingsManager, messageService);
    const uiRenderer = new UrdUIRenderer(shadow);
    const domHandler = new UrdUIDOMHandler(shadow, this.timerService);
    this.uiService = new UrdUIService(shadow, this.timerService, uiRenderer, domHandler);
    this.timerService.addObserver(this.uiService);
  }

  async connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    await this.uiService.initialize();
    this.timerService.loadSettings();
    await this.addEventListeners();
  }

  disconnectedCallback() {
    this.uiService.removeKeyboardListener();
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
      const shortBreaksBeforeLong = this.getInputValue('#short-breaks-before-long', 4);
      this.timerService.updateSettings(workDuration, shortBreakDuration, longBreakDuration, shortBreaksBeforeLong);
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
