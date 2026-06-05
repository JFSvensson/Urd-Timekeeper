import { StorageService } from '../../services/StorageService';
import {
  SECONDS_PER_MINUTE,
  DEFAULT_WORK_DURATION,
  DEFAULT_SHORT_BREAK_DURATION,
  DEFAULT_LONG_BREAK_DURATION,
  DEFAULT_SHORT_BREAKS_BEFORE_LONG,
  MIN_DURATION_MINUTES,
  MAX_DURATION_MINUTES,
  MIN_SHORT_BREAKS_BEFORE_LONG,
  MAX_SHORT_BREAKS_BEFORE_LONG,
  MIN_VOLUME,
  MAX_VOLUME,
} from './UrdConstants';

export interface TimerSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  shortBreaksBeforeLong: number;
  soundEnabled: boolean;
  volume: number;
}

export class UrdSettingsManager {
  private static readonly STORAGE_KEY = 'urdTimerSettings';

  constructor(private storageService: StorageService) {}

  getDefaults(): TimerSettings {
    return {
      workDuration: DEFAULT_WORK_DURATION,
      shortBreakDuration: DEFAULT_SHORT_BREAK_DURATION,
      longBreakDuration: DEFAULT_LONG_BREAK_DURATION,
      shortBreaksBeforeLong: DEFAULT_SHORT_BREAKS_BEFORE_LONG,
      soundEnabled: true,
      volume: 0.5,
    };
  }

  loadSettings(): TimerSettings {
    try {
      const savedSettings = this.storageService.getItem(UrdSettingsManager.STORAGE_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        return this.validateSettings(parsed);
      }
    } catch (error) {
      console.error('Failed to load timer settings, using defaults:', error);
    }
    return this.getDefaults();
  }

  saveSettings(settings: TimerSettings): void {
    try {
      const validated = this.validateSettings(settings);
      this.storageService.setItem(UrdSettingsManager.STORAGE_KEY, JSON.stringify(validated));
    } catch (error) {
      console.error('Failed to save timer settings:', error);
    }
  }

  private validateSettings(settings: Partial<TimerSettings>): TimerSettings {
    const defaults = this.getDefaults();

    return {
      workDuration: this.validateDuration(settings.workDuration, defaults.workDuration),
      shortBreakDuration: this.validateDuration(
        settings.shortBreakDuration,
        defaults.shortBreakDuration
      ),
      longBreakDuration: this.validateDuration(
        settings.longBreakDuration,
        defaults.longBreakDuration
      ),
      shortBreaksBeforeLong: this.validateCount(
        settings.shortBreaksBeforeLong,
        defaults.shortBreaksBeforeLong
      ),
      soundEnabled:
        typeof settings.soundEnabled === 'boolean' ? settings.soundEnabled : defaults.soundEnabled,
      volume: this.validateVolume(settings.volume, defaults.volume),
    };
  }

  private validateDuration(value: unknown, defaultValue: number): number {
    const num = Number(value);
    return !isNaN(num) && num >= MIN_DURATION_MINUTES && num <= MAX_DURATION_MINUTES
      ? num
      : defaultValue;
  }

  private validateCount(value: unknown, defaultValue: number): number {
    const num = Number(value);
    return !isNaN(num) && num >= MIN_SHORT_BREAKS_BEFORE_LONG && num <= MAX_SHORT_BREAKS_BEFORE_LONG
      ? num
      : defaultValue;
  }

  private validateVolume(value: unknown, defaultValue: number): number {
    const num = Number(value);
    return !isNaN(num) && num >= MIN_VOLUME && num <= MAX_VOLUME ? num : defaultValue;
  }

  getSettingsInSeconds(settings: TimerSettings) {
    return {
      workDuration: settings.workDuration * SECONDS_PER_MINUTE,
      shortBreakDuration: settings.shortBreakDuration * SECONDS_PER_MINUTE,
      longBreakDuration: settings.longBreakDuration * SECONDS_PER_MINUTE,
      shortBreaksBeforeLong: settings.shortBreaksBeforeLong,
    };
  }
}
