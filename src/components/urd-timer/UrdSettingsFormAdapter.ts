import { TimerSettings } from './UrdSettingsManager';
import {
  MIN_DURATION_MINUTES,
  MAX_DURATION_MINUTES,
  MIN_SHORT_BREAKS_BEFORE_LONG,
  MAX_SHORT_BREAKS_BEFORE_LONG,
  MIN_VOLUME_PERCENT,
  MAX_VOLUME_PERCENT,
} from './UrdConstants';

export class UrdSettingsFormAdapter {
  private inputElements = {
    workDuration: null as HTMLInputElement | null,
    shortBreakDuration: null as HTMLInputElement | null,
    longBreakDuration: null as HTMLInputElement | null,
    shortBreaksBeforeLong: null as HTMLInputElement | null,
    soundEnabled: null as HTMLInputElement | null,
    volumeSetting: null as HTMLInputElement | null,
  };

  initialize(shadowRoot: ShadowRoot): void {
    this.inputElements.workDuration = shadowRoot.querySelector('#work-duration');
    this.inputElements.shortBreakDuration = shadowRoot.querySelector('#short-break-duration');
    this.inputElements.longBreakDuration = shadowRoot.querySelector('#long-break-duration');
    this.inputElements.shortBreaksBeforeLong = shadowRoot.querySelector(
      '#short-breaks-before-long'
    );
    this.inputElements.soundEnabled = shadowRoot.querySelector('#sound-enabled');
    this.inputElements.volumeSetting = shadowRoot.querySelector('#volume-setting');
  }

  populate(settings: TimerSettings): void {
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
      this.inputElements.volumeSetting.value = String(
        Math.round(settings.volume * MAX_VOLUME_PERCENT)
      );
    }
  }

  read(current: TimerSettings): TimerSettings {
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
}
