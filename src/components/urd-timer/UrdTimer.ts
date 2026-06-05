import { UrdUIService } from './UrdUIService';
import { UrdTimerService } from './UrdTimerService';
import { StorageService } from '../../services/StorageService';
import { MessageService } from '../../services/MessageService';
import { AudioService } from '../../services/AudioService';
import { BrowserStorageService } from '../../services/BrowserStorageService';
import { WebPageMessageService } from '../../services/WebPageMessageService';
import { BrowserAudioService } from '../../services/BrowserAudioService';
import { SessionHistoryService } from '../../services/SessionHistoryService';
import { NoOpMessageService } from '../../services/NoOpMessageService';
import { UrdUIRenderer } from './UrdUIRenderer';
import { UrdUIDOMHandler } from './UrdUIDOMHandler';
import { UrdSettingsManager } from './UrdSettingsManager';
import { Player } from '../player/Player';
import { MIN_DURATION_MINUTES, MAX_DURATION_MINUTES } from './UrdConstants';

export class UrdTimer extends HTMLElement {
  private timerService: UrdTimerService;
  private uiService: UrdUIService;
  private overlayAutostartTimeout: number | null = null;
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
      messageService = new NoOpMessageService();
    }

    const settingsManager = new UrdSettingsManager(storageService);
    const sessionHistory = new SessionHistoryService(storageService);
    this.timerService = new UrdTimerService(
      settingsManager,
      messageService,
      this.overlayMode,
      audioService,
      sessionHistory
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
      this.overlayAutostartTimeout = window.setTimeout(() => {
        this.overlayAutostartTimeout = null;
        this.timerService.start();
      }, 1000);
    } else {
      this.timerService.loadSettings();
      await this.addEventListeners();
      this.mountPlayer();
    }
  }

  disconnectedCallback() {
    if (this.overlayAutostartTimeout) {
      window.clearTimeout(this.overlayAutostartTimeout);
      this.overlayAutostartTimeout = null;
    }

    this.timerService.stop();
    this.uiService.removeKeyboardListener();
    this.uiService.removeEventListeners();
  }

  private parseOverlayQueryParams(): void {
    const params = new URLSearchParams(window.location.search);

    this.overlayConfig.workDuration = this.parseOverlayDuration(
      params.get('work'),
      this.overlayConfig.workDuration
    );
    this.overlayConfig.breakDuration = this.parseOverlayDuration(
      params.get('break'),
      this.overlayConfig.breakDuration
    );

    // Always use center position in overlay mode
    this.overlayConfig.position = 'center';
  }

  private parseOverlayDuration(value: string | null, fallback: number): number {
    const parsed = Number.parseInt(value ?? '', 10);
    if (Number.isNaN(parsed)) {
      return fallback;
    }

    if (parsed < MIN_DURATION_MINUTES || parsed > MAX_DURATION_MINUTES) {
      return fallback;
    }

    return parsed;
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
