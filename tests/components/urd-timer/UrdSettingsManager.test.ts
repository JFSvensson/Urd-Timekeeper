import {
  UrdSettingsManager,
  TimerSettings,
} from '../../../src/components/urd-timer/UrdSettingsManager';
import { StorageService } from '../../../src/services/StorageService';
import {
  DEFAULT_WORK_DURATION,
  DEFAULT_SHORT_BREAK_DURATION,
  DEFAULT_LONG_BREAK_DURATION,
  DEFAULT_SHORT_BREAKS_BEFORE_LONG,
  SECONDS_PER_MINUTE,
} from '../../../src/components/urd-timer/UrdConstants';

class MockStorageService implements StorageService {
  private store: { [key: string]: string } = {};

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

describe('UrdSettingsManager', () => {
  let settingsManager: UrdSettingsManager;
  let mockStorageService: MockStorageService;

  beforeEach(() => {
    mockStorageService = new MockStorageService();
    settingsManager = new UrdSettingsManager(mockStorageService);
  });

  describe('getDefaults', () => {
    test('should return default settings', () => {
      const defaults = settingsManager.getDefaults();

      expect(defaults.workDuration).toBe(DEFAULT_WORK_DURATION);
      expect(defaults.shortBreakDuration).toBe(DEFAULT_SHORT_BREAK_DURATION);
      expect(defaults.longBreakDuration).toBe(DEFAULT_LONG_BREAK_DURATION);
      expect(defaults.shortBreaksBeforeLong).toBe(DEFAULT_SHORT_BREAKS_BEFORE_LONG);
    });
  });

  describe('loadSettings', () => {
    test('should return defaults when no saved settings exist', () => {
      const settings = settingsManager.loadSettings();

      expect(settings.workDuration).toBe(DEFAULT_WORK_DURATION);
      expect(settings.shortBreakDuration).toBe(DEFAULT_SHORT_BREAK_DURATION);
      expect(settings.longBreakDuration).toBe(DEFAULT_LONG_BREAK_DURATION);
      expect(settings.shortBreaksBeforeLong).toBe(DEFAULT_SHORT_BREAKS_BEFORE_LONG);
    });

    test('should load saved settings from storage', () => {
      const savedSettings: TimerSettings = {
        workDuration: 30,
        shortBreakDuration: 10,
        longBreakDuration: 20,
        shortBreaksBeforeLong: 3,
      };

      mockStorageService.setItem('urdTimerSettings', JSON.stringify(savedSettings));
      const settings = settingsManager.loadSettings();

      expect(settings).toEqual(savedSettings);
    });

    test('should return defaults when JSON parsing fails', () => {
      mockStorageService.setItem('urdTimerSettings', '{invalid json}');

      const settings = settingsManager.loadSettings();

      expect(settings.workDuration).toBe(DEFAULT_WORK_DURATION);
    });

    test('should validate and correct invalid duration values', () => {
      const invalidSettings = {
        workDuration: -10,
        shortBreakDuration: 0,
        longBreakDuration: 150,
        shortBreaksBeforeLong: 5,
      };

      mockStorageService.setItem('urdTimerSettings', JSON.stringify(invalidSettings));
      const settings = settingsManager.loadSettings();

      expect(settings.workDuration).toBe(DEFAULT_WORK_DURATION);
      expect(settings.shortBreakDuration).toBe(DEFAULT_SHORT_BREAK_DURATION);
      expect(settings.longBreakDuration).toBe(DEFAULT_LONG_BREAK_DURATION);
      expect(settings.shortBreaksBeforeLong).toBe(5);
    });

    test('should validate and correct invalid count values', () => {
      const invalidSettings = {
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        shortBreaksBeforeLong: 15,
      };

      mockStorageService.setItem('urdTimerSettings', JSON.stringify(invalidSettings));
      const settings = settingsManager.loadSettings();

      expect(settings.shortBreaksBeforeLong).toBe(DEFAULT_SHORT_BREAKS_BEFORE_LONG);
    });
  });

  describe('saveSettings', () => {
    test('should save valid settings to storage', () => {
      const settings: TimerSettings = {
        workDuration: 45,
        shortBreakDuration: 12,
        longBreakDuration: 25,
        shortBreaksBeforeLong: 6,
      };

      settingsManager.saveSettings(settings);

      const saved = mockStorageService.getItem('urdTimerSettings');
      expect(saved).toBeTruthy();

      const parsed = JSON.parse(saved!);
      expect(parsed).toEqual(settings);
    });

    test('should validate settings before saving', () => {
      const invalidSettings = {
        workDuration: 200,
        shortBreakDuration: -5,
        longBreakDuration: 15,
        shortBreaksBeforeLong: 20,
      } as TimerSettings;

      settingsManager.saveSettings(invalidSettings);

      const saved = mockStorageService.getItem('urdTimerSettings');
      const parsed = JSON.parse(saved!);

      expect(parsed.workDuration).toBe(DEFAULT_WORK_DURATION);
      expect(parsed.shortBreakDuration).toBe(DEFAULT_SHORT_BREAK_DURATION);
      expect(parsed.shortBreaksBeforeLong).toBe(DEFAULT_SHORT_BREAKS_BEFORE_LONG);
    });
  });

  describe('getSettingsInSeconds', () => {
    test('should convert duration settings from minutes to seconds', () => {
      const settings: TimerSettings = {
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        shortBreaksBeforeLong: 4,
      };

      const settingsInSeconds = settingsManager.getSettingsInSeconds(settings);

      expect(settingsInSeconds.workDuration).toBe(25 * SECONDS_PER_MINUTE);
      expect(settingsInSeconds.shortBreakDuration).toBe(5 * SECONDS_PER_MINUTE);
      expect(settingsInSeconds.longBreakDuration).toBe(15 * SECONDS_PER_MINUTE);
      expect(settingsInSeconds.shortBreaksBeforeLong).toBe(4);
    });
  });

  describe('validation', () => {
    test('should accept valid duration values between 1 and 120', () => {
      const settings: TimerSettings = {
        workDuration: 1,
        shortBreakDuration: 60,
        longBreakDuration: 120,
        shortBreaksBeforeLong: 5,
      };

      settingsManager.saveSettings(settings);
      const saved = JSON.parse(mockStorageService.getItem('urdTimerSettings')!);

      expect(saved.workDuration).toBe(1);
      expect(saved.shortBreakDuration).toBe(60);
      expect(saved.longBreakDuration).toBe(120);
    });

    test('should accept valid count values between 1 and 10', () => {
      const settings: TimerSettings = {
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        shortBreaksBeforeLong: 10,
      };

      settingsManager.saveSettings(settings);
      const saved = JSON.parse(mockStorageService.getItem('urdTimerSettings')!);

      expect(saved.shortBreaksBeforeLong).toBe(10);
    });

    test('should handle non-numeric values', () => {
      const invalidSettings = {
        workDuration: 'abc',
        shortBreakDuration: null,
        longBreakDuration: undefined,
        shortBreaksBeforeLong: NaN,
      } as any;

      mockStorageService.setItem('urdTimerSettings', JSON.stringify(invalidSettings));
      const settings = settingsManager.loadSettings();

      expect(settings.workDuration).toBe(DEFAULT_WORK_DURATION);
      expect(settings.shortBreakDuration).toBe(DEFAULT_SHORT_BREAK_DURATION);
      expect(settings.longBreakDuration).toBe(DEFAULT_LONG_BREAK_DURATION);
      expect(settings.shortBreaksBeforeLong).toBe(DEFAULT_SHORT_BREAKS_BEFORE_LONG);
    });
  });
});
