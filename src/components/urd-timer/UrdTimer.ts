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
  private overlayMode: boolean = false;
  private overlayConfig = {
    workDuration: 50,
    breakDuration: 10,
    position: 'top-right'
  };

  constructor(
    storageService: StorageService = new BrowserStorageService(),
    messageService: MessageService = new WebPageMessageService()
  ) {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    
    // Check if overlay mode is enabled
    this.overlayMode = this.hasAttribute('overlay-mode');
    
    // Parse query parameters if in overlay mode
    if (this.overlayMode) {
      this.parseOverlayQueryParams();
      // Disable notifications in overlay mode
      messageService = { showMessage: () => {} } as MessageService;
    }
    
    const settingsManager = new UrdSettingsManager(storageService);
    this.timerService = new UrdTimerService(settingsManager, messageService, this.overlayMode);
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
    
    if (this.overlayMode) {
      // Apply overlay settings and hide UI elements
      this.applyOverlayMode();
      this.timerService.updateSettings(
        this.overlayConfig.workDuration,
        this.overlayConfig.breakDuration,
        15, // longBreakDuration (not used much in overlay)
        4   // shortBreaksBeforeLong
      );
      // Auto-start the timer in overlay mode
      setTimeout(() => this.timerService.start(), 1000);
    } else {
      this.timerService.loadSettings();
      await this.addEventListeners();
    }
  }

  disconnectedCallback() {
    this.uiService.removeKeyboardListener();
  }
  
  private parseOverlayQueryParams(): void {
    const params = new URLSearchParams(window.location.search);
    
    if (params.has('work')) {
      this.overlayConfig.workDuration = parseInt(params.get('work')!, 10) || 50;
    }
    if (params.has('break')) {
      this.overlayConfig.breakDuration = parseInt(params.get('break')!, 10) || 10;
    }
    if (params.has('position')) {
      this.overlayConfig.position = params.get('position')! || 'top-right';
    }
  }
  
  private applyOverlayMode(): void {
    if (!this.shadowRoot) return;
    
    // Add overlay-mode class to container
    const container = this.shadowRoot.querySelector('#timer-container');
    container?.classList.add('overlay-mode');
    
    // Set position attribute for CSS
    container?.setAttribute('data-position', this.overlayConfig.position);
    
    // Hide all UI controls
    const elementsToHide = [
      'h1',
      '#start-stop',
      '#reset',
      '#settings-panel',
      '.keyboard-shortcut'
    ];
    
    elementsToHide.forEach(selector => {
      const element = this.shadowRoot!.querySelector(selector);
      if (element) {
        (element as HTMLElement).style.display = 'none';
      }
    });
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
