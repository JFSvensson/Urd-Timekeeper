import { UrdTimerService } from './UrdTimerService';
import { TimerSettings } from './UrdSettingsManager';
import { UrdSettingsFormAdapter } from './UrdSettingsFormAdapter';

export class UrdUIDOMHandler {
  private settingsForm = new UrdSettingsFormAdapter();
  private saveSettingsButton: HTMLButtonElement | null = null;
  private startStopButton: HTMLElement | null = null;
  private resetButton: HTMLElement | null = null;
  private onSaveSettingsClick: (() => void) | null = null;
  private onToggleClick: (() => void) | null = null;
  private onResetClick: (() => void) | null = null;

  constructor(
    private shadowRoot: ShadowRoot,
    private timerService: UrdTimerService
  ) {}

  initializeDOMElements(): void {
    this.settingsForm.initialize(this.shadowRoot);
    this.saveSettingsButton = this.shadowRoot.querySelector('#save-settings');
  }

  populateSettings(settings: TimerSettings): void {
    this.settingsForm.populate(settings);
  }

  addSettingsEventListeners(): void {
    if (!this.saveSettingsButton) return;

    if (this.onSaveSettingsClick) {
      this.saveSettingsButton.removeEventListener('click', this.onSaveSettingsClick);
    }

    this.onSaveSettingsClick = () => {
      const settings = this.settingsForm.read(this.timerService.getSettings());
      this.timerService.updateSettings(
        settings.workDuration,
        settings.shortBreakDuration,
        settings.longBreakDuration,
        settings.shortBreaksBeforeLong,
        settings.soundEnabled,
        settings.volume
      );
    };

    this.saveSettingsButton.addEventListener('click', this.onSaveSettingsClick);
  }

  addButtonListeners(toggleCallback: () => void, resetCallback: () => void): void {
    this.removeButtonListeners();

    this.startStopButton = this.shadowRoot.querySelector('#start-stop');
    this.resetButton = this.shadowRoot.querySelector('#reset');

    if (this.startStopButton && this.resetButton) {
      this.onToggleClick = toggleCallback;
      this.onResetClick = resetCallback;

      this.startStopButton.addEventListener('click', this.onToggleClick);
      this.resetButton.addEventListener('click', this.onResetClick);
    } else {
      console.error('Buttons not found in the shadow DOM');
    }
  }

  removeEventListeners(): void {
    if (this.saveSettingsButton && this.onSaveSettingsClick) {
      this.saveSettingsButton.removeEventListener('click', this.onSaveSettingsClick);
    }
    this.onSaveSettingsClick = null;
    this.removeButtonListeners();
  }

  private removeButtonListeners(): void {
    if (this.startStopButton && this.onToggleClick) {
      this.startStopButton.removeEventListener('click', this.onToggleClick);
    }
    if (this.resetButton && this.onResetClick) {
      this.resetButton.removeEventListener('click', this.onResetClick);
    }

    this.startStopButton = null;
    this.resetButton = null;
    this.onToggleClick = null;
    this.onResetClick = null;
  }
}
