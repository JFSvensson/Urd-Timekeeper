import { UrdTimerService } from './UrdTimerService';
import { TimerSettings } from './UrdSettingsManager';
import {
  MIN_DURATION_MINUTES,
  MAX_DURATION_MINUTES,
  MIN_SHORT_BREAKS_BEFORE_LONG,
  MAX_SHORT_BREAKS_BEFORE_LONG,
  MIN_VOLUME_PERCENT,
  MAX_VOLUME_PERCENT,
} from './UrdConstants';

export class UrdUIDOMHandler {
  private inputElements = {
    workDuration: null as HTMLInputElement | null,
    shortBreakDuration: null as HTMLInputElement | null,
    longBreakDuration: null as HTMLInputElement | null,
    shortBreaksBeforeLong: null as HTMLInputElement | null,
    soundEnabled: null as HTMLInputElement | null,
    volumeSetting: null as HTMLInputElement | null,
  };
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
    this.inputElements.workDuration = this.shadowRoot.querySelector('#work-duration');
    this.inputElements.shortBreakDuration = this.shadowRoot.querySelector('#short-break-duration');
    this.inputElements.longBreakDuration = this.shadowRoot.querySelector('#long-break-duration');
    this.inputElements.shortBreaksBeforeLong = this.shadowRoot.querySelector(
      '#short-breaks-before-long'
    );
    this.inputElements.soundEnabled = this.shadowRoot.querySelector('#sound-enabled');
    this.inputElements.volumeSetting = this.shadowRoot.querySelector('#volume-setting');
    this.saveSettingsButton = this.shadowRoot.querySelector('#save-settings');
  }

  populateSettings(settings: TimerSettings): void {
    if (this.inputElements.workDuration) {
      this.inputElements.workDuration.value = String(settings.workDuration);
    }
    if (this.inputElements.shortBreakDuration) {
      this.inputElements.shortBreakDuration.value = String(settings.shortBreakDuration);
    }
    if (this.inputElements.longBreakDuration) {
      this.inputElements.longBreakDuration.value = String(settings.longBreakDuration);
    }
    if (this.inputElements.shortBreaksBeforeLong) {
      this.inputElements.shortBreaksBeforeLong.value = String(settings.shortBreaksBeforeLong);
    }
    if (this.inputElements.soundEnabled) {
      this.inputElements.soundEnabled.checked = settings.soundEnabled;
    }
    if (this.inputElements.volumeSetting) {
      this.inputElements.volumeSetting.value = String(Math.round(settings.volume * 100));
    }
  }

  addSettingsEventListeners(): void {
    if (!this.saveSettingsButton) return;

    if (this.onSaveSettingsClick) {
      this.saveSettingsButton.removeEventListener('click', this.onSaveSettingsClick);
    }

    this.onSaveSettingsClick = () => {
      const settings = this.getUpdatedSettings();
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

  private getUpdatedSettings() {
    const current = this.timerService.getSettings();

    return {
      workDuration: this.parseBoundedInt(
        this.inputElements.workDuration?.value,
        current.workDuration,
        MIN_DURATION_MINUTES,
        MAX_DURATION_MINUTES
      ),
      shortBreakDuration: this.parseBoundedInt(
        this.inputElements.shortBreakDuration?.value,
        current.shortBreakDuration,
        MIN_DURATION_MINUTES,
        MAX_DURATION_MINUTES
      ),
      longBreakDuration: this.parseBoundedInt(
        this.inputElements.longBreakDuration?.value,
        current.longBreakDuration,
        MIN_DURATION_MINUTES,
        MAX_DURATION_MINUTES
      ),
      shortBreaksBeforeLong: this.inputElements.shortBreaksBeforeLong
        ? this.parseBoundedInt(
            this.inputElements.shortBreaksBeforeLong.value,
            current.shortBreaksBeforeLong,
            MIN_SHORT_BREAKS_BEFORE_LONG,
            MAX_SHORT_BREAKS_BEFORE_LONG
          )
        : current.shortBreaksBeforeLong,
      soundEnabled: this.inputElements.soundEnabled
        ? this.inputElements.soundEnabled.checked
        : current.soundEnabled,
      volume: this.inputElements.volumeSetting
        ? this.parseBoundedInt(
            this.inputElements.volumeSetting.value,
            Math.round(current.volume * MAX_VOLUME_PERCENT),
            MIN_VOLUME_PERCENT,
            MAX_VOLUME_PERCENT
          ) / MAX_VOLUME_PERCENT
        : current.volume,
    };
  }

  private parseBoundedInt(
    value: string | undefined,
    fallback: number,
    min: number,
    max: number
  ): number {
    const parsed = Number.parseInt(value ?? '', 10);
    if (Number.isNaN(parsed)) {
      return fallback;
    }

    if (parsed < min || parsed > max) {
      return fallback;
    }

    return parsed;
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
