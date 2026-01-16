import { UrdTimerService } from '../../../src/components/urd-timer/UrdTimerService';
import { SessionType } from '../../../src/components/urd-timer/UrdSessionType';
import { StorageService } from '../../../src/services/StorageService';
import { MessageService } from '../../../src/services/MessageService';
import { UrdSettingsManager } from '../../../src/components/urd-timer/UrdSettingsManager';
import { SECONDS_PER_MINUTE, DEFAULT_WORK_DURATION, DEFAULT_SHORT_BREAK_DURATION, DEFAULT_LONG_BREAK_DURATION, DEFAULT_SHORT_BREAKS_BEFORE_LONG } from '../../../src/components/urd-timer/UrdConstants';

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

class MockMessageService implements MessageService {
  showMessage(message: string): void {
    console.log('Mock message:', message);
  }
}

describe('UrdTimerService', () => {
  let timerService: UrdTimerService;
  let mockStorageService: MockStorageService;
  let mockMessageService: MockMessageService;
  let settingsManager: UrdSettingsManager;

  beforeEach(() => {
    mockStorageService = new MockStorageService();
    mockMessageService = new MockMessageService();
    settingsManager = new UrdSettingsManager(mockStorageService);
    timerService = new UrdTimerService(settingsManager, mockMessageService);
  });

  test('should initialize with default values', () => {
    const state = timerService.getState();
    const config = timerService.getConfig();
    
    expect(timerService.getWorkDuration()).toBe(DEFAULT_WORK_DURATION * SECONDS_PER_MINUTE);
    expect(config.workDuration).toBe(DEFAULT_WORK_DURATION);
    expect(config.shortBreakDuration).toBe(DEFAULT_SHORT_BREAK_DURATION);
    expect(config.longBreakDuration).toBe(DEFAULT_LONG_BREAK_DURATION);
    expect(config.shortBreaksBeforeLong).toBe(DEFAULT_SHORT_BREAKS_BEFORE_LONG);
    expect(state.currentSession).toBe(SessionType.Work);
    expect(state.isRunning).toBe(false);
  });

  test('should update settings correctly', () => {
    timerService.updateSettings(30, 10, 20, 5);
    const config = timerService.getConfig();
    
    expect(timerService.getWorkDuration()).toBe(30 * SECONDS_PER_MINUTE);
    expect(config.workDuration).toBe(30);
    expect(config.shortBreakDuration).toBe(10);
    expect(config.longBreakDuration).toBe(20);
    expect(config.shortBreaksBeforeLong).toBe(5);
  });

  test('should switch to short break after work session', () => {
    jest.useFakeTimers();
    timerService.toggle();
    
    // Advance to complete the work session (add extra time to ensure completion)
    jest.advanceTimersByTime((DEFAULT_WORK_DURATION * SECONDS_PER_MINUTE + 2) * 1000);
    
    const state = timerService.getState();
    expect(state.currentSession).toBe(SessionType.ShortBreak);
    
    jest.useRealTimers();
  });

  test('should track session type correctly', () => {
    // Start with work session
    expect(timerService.getCurrentSession()).toBe(SessionType.Work);
    
    // Verify we can update settings
    timerService.updateSettings(30, 10, 20, 3);
    expect(timerService.getCurrentSession()).toBe(SessionType.Work);
  });

  test('should reset correctly', () => {
    timerService.updateSettings(30, 10, 20, 5);
    timerService.reset();
    const state = timerService.getState();
    
    expect(timerService.getWorkDuration()).toBe(30 * SECONDS_PER_MINUTE);
    expect(state.timeLeft).toBe(30 * SECONDS_PER_MINUTE);
    expect(state.currentSession).toBe(SessionType.Work);
  });

  test('should return complete state snapshot', () => {
    const state = timerService.getState();
    
    expect(state).toHaveProperty('timeLeft');
    expect(state).toHaveProperty('isRunning');
    expect(state).toHaveProperty('currentSession');
    expect(state).toHaveProperty('completedSessions');
    expect(typeof state.timeLeft).toBe('number');
    expect(typeof state.isRunning).toBe('boolean');
  });

  test('should return complete config', () => {
    const config = timerService.getConfig();
    
    expect(config).toHaveProperty('workDuration');
    expect(config).toHaveProperty('shortBreakDuration');
    expect(config).toHaveProperty('longBreakDuration');
    expect(config).toHaveProperty('shortBreaksBeforeLong');
  });

  test('should handle malformed JSON in localStorage gracefully', () => {
    mockStorageService.setItem('urdTimerSettings', '{invalid json}');
    
    expect(() => timerService.loadSettings()).not.toThrow();
    const config = timerService.getConfig();
    expect(config.workDuration).toBe(DEFAULT_WORK_DURATION);
  });

  test('should toggle between running and paused states', () => {
    expect(timerService.getIsRunning()).toBe(false);
    
    timerService.toggle();
    expect(timerService.getIsRunning()).toBe(true);
    
    timerService.toggle();
    expect(timerService.getIsRunning()).toBe(false);
  });

  test('should track time left during timer countdown', () => {
    jest.useFakeTimers();
    
    const initialTime = timerService.getTimeLeft();
    timerService.toggle();
    
    jest.advanceTimersByTime(3000);
    
    expect(timerService.getTimeLeft()).toBe(initialTime - 3);
    
    jest.useRealTimers();
  });

  test('should persist settings to storage', () => {
    timerService.updateSettings(45, 15, 30, 3);
    
    const savedData = mockStorageService.getItem('urdTimerSettings');
    expect(savedData).toBeTruthy();
    
    const parsed = JSON.parse(savedData!);
    expect(parsed.workDuration).toBe(45);
    expect(parsed.shortBreakDuration).toBe(15);
    expect(parsed.longBreakDuration).toBe(30);
    expect(parsed.shortBreaksBeforeLong).toBe(3);
  });

  test('should load settings from storage', () => {
    mockStorageService.setItem('urdTimerSettings', JSON.stringify({
      workDuration: 50,
      shortBreakDuration: 12,
      longBreakDuration: 25,
      shortBreaksBeforeLong: 6
    }));
    
    timerService.loadSettings();
    const config = timerService.getConfig();
    
    expect(config.workDuration).toBe(50);
    expect(config.shortBreakDuration).toBe(12);
    expect(config.longBreakDuration).toBe(25);
    expect(config.shortBreaksBeforeLong).toBe(6);
  });
});