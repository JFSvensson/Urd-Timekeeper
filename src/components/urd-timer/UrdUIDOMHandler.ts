import { UrdTimerService } from './UrdTimerService';
import { TimerSettings } from './UrdSettingsManager';
import { UrdSettingsFormAdapter } from './UrdSettingsFormAdapter';
import { UrdTimerControlsAdapter } from './UrdTimerControlsAdapter';

export class UrdUIDOMHandler {
  private settingsForm = new UrdSettingsFormAdapter();
  private controls = new UrdTimerControlsAdapter();
  private saveSettingsButton: HTMLButtonElement | null = null;
  private onSaveSettingsClick: (() => void) | null = null;

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
    this.controls.bind(this.shadowRoot, toggleCallback, resetCallback);
  }

  removeEventListeners(): void {
    if (this.saveSettingsButton && this.onSaveSettingsClick) {
      this.saveSettingsButton.removeEventListener('click', this.onSaveSettingsClick);
    }
    this.onSaveSettingsClick = null;
    this.controls.removeListeners();
  }
}
