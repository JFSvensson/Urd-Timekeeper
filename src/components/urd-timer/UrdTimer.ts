import { UrdUIService } from './UrdUIService';
import { UrdTimerService } from './UrdTimerService';
import { StorageService } from '../../services/StorageService';
import { MessageService } from '../../services/MessageService';
import { AudioService } from '../../services/AudioService';
import { BrowserStorageService } from '../../services/BrowserStorageService';
import { WebPageMessageService } from '../../services/WebPageMessageService';
import { BrowserAudioService } from '../../services/BrowserAudioService';
import { UrdUIRenderer } from './UrdUIRenderer';
import { UrdUIDOMHandler } from './UrdUIDOMHandler';
import { UrdSettingsManager } from './UrdSettingsManager';
import { Player } from '../player/Player';

export class UrdTimer extends HTMLElement {
  private timerService: UrdTimerService;
  private uiService: UrdUIService;
  private overlayMode: boolean = false;
  private overlayConfig = {
    workDuration: 50,
    breakDuration: 10,
    position: 'top-right',
  };

  constructor(
    storageService: StorageService = new BrowserStorageService(),
    messageService: MessageService = new WebPageMessageService(),
    audioService: AudioService = new BrowserAudioService()
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
    this.timerService = new UrdTimerService(
      settingsManager,
      messageService,
      this.overlayMode,
      audioService
    );
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
      this.uiService.removeKeyboardListener();
      this.timerService.updateSettings(
        this.overlayConfig.workDuration,
        this.overlayConfig.breakDuration,
        15, // longBreakDuration (not used much in overlay)
        4 // shortBreaksBeforeLong
      );
      // Auto-start the timer in overlay mode
      setTimeout(() => this.timerService.start(), 1000);
    } else {
      this.timerService.loadSettings();
      await this.addEventListeners();
      this.mountPlayer();
    }
  }

  disconnectedCallback() {
    this.uiService.removeKeyboardListener();
  }

  private parseOverlayQueryParams(): void {
    const params = new URLSearchParams(window.location.search);

    if (params.has('work')) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.overlayConfig.workDuration = parseInt(params.get('work')!, 10) || 50;
    }
    if (params.has('break')) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.overlayConfig.breakDuration = parseInt(params.get('break')!, 10) || 10;
    }
    // Always use center position in overlay mode
    this.overlayConfig.position = 'center';
  }

  private applyOverlayMode(): void {
    if (!this.shadowRoot) return;

    // Add overlay-mode class to container
    const container = this.shadowRoot.querySelector('#timer-container');
    container?.classList.add('overlay-mode');

    // Set position attribute for CSS
    container?.setAttribute('data-position', this.overlayConfig.position);

    // Hide all UI controls and text
    const elementsToHide = [
      'h1',
      '#start-stop',
      '#reset',
      '.settings',
      '.keyboard-shortcut',
      '#session-info',
      '#time-display',
      '.timer-content',
    ];

    elementsToHide.forEach((selector) => {
      const element = this.shadowRoot?.querySelector(selector);
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
    this.uiService.addSettingsEventListeners();
  }

  private mountPlayer(): void {
    if (!this.shadowRoot) return;
    const container = this.shadowRoot.querySelector('#player-container');
    if (!container) return;

    const player = new Player();
    container.appendChild(player);

    const audioService = this.timerService.getAudioService();
    if (audioService) {
      player.setAudioService(audioService);
    }
  }
}

if (!customElements.get('urd-timer')) {
  customElements.define('urd-timer', UrdTimer);
}
