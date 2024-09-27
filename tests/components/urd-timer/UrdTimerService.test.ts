import { UrdTimerService } from '../../../src/components/urd-timer/UrdTimerService';
import { SessionType } from '../../../src/components/urd-timer/UrdSessionType';
import { StorageService } from '../../../src/services/StorageService';
import { MessageService } from '../../../src/services/MessageService';
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
    // Gör ingenting i testerna, eller logga meddelandet om du vill verifiera det
    console.log('Mock message:', message);
  }
}

describe('UrdTimerService', () => {
  let timerService: UrdTimerService;
  let mockStorageService: MockStorageService;
  let mockMessageService: MockMessageService;

  beforeEach(() => {
    mockStorageService = new MockStorageService();
    mockMessageService = new MockMessageService();
    timerService = new UrdTimerService(mockStorageService, mockMessageService);
  });

  test('should initialize with default values', () => {
    expect(timerService.getWorkDuration()).toBe(DEFAULT_WORK_DURATION * SECONDS_PER_MINUTE);
    expect(timerService['shortBreakDuration']).toBe(DEFAULT_SHORT_BREAK_DURATION * SECONDS_PER_MINUTE);
    expect(timerService['longBreakDuration']).toBe(DEFAULT_LONG_BREAK_DURATION * SECONDS_PER_MINUTE);
    expect(timerService['shortBreaksBeforeLong']).toBe(DEFAULT_SHORT_BREAKS_BEFORE_LONG * SECONDS_PER_MINUTE);
    expect(timerService.getCurrentSession()).toBe(SessionType.Work);
  });

  test('should update settings correctly', () => {
    timerService.updateSettings(30, 10, 20, 5);
    expect(timerService.getWorkDuration()).toBe(30 * SECONDS_PER_MINUTE);
    expect(timerService['shortBreakDuration']).toBe(10 * SECONDS_PER_MINUTE);
    expect(timerService['longBreakDuration']).toBe(20 * SECONDS_PER_MINUTE);
    expect(timerService['shortBreaksBeforeLong']).toBe(5);
  });

  test('should switch to short break after work session', () => {
    timerService['timeLeft'] = 0;
    timerService['switchMode']();
    expect(timerService.getCurrentSession()).toBe(SessionType.ShortBreak);
    expect(timerService['timeLeft']).toBe(DEFAULT_SHORT_BREAK_DURATION * SECONDS_PER_MINUTE);
  });

  test('should switch to long break after specified number of short breaks', () => {
    timerService.updateSettings(25, 5, 15, 2);
    timerService['completedSessions'] = 1;
    timerService['timeLeft'] = 0;
    timerService['switchMode']();
    expect(timerService.getCurrentSession()).toBe(SessionType.LongBreak);
    expect(timerService['timeLeft']).toBe(DEFAULT_LONG_BREAK_DURATION * SECONDS_PER_MINUTE);
  });

  test('should reset correctly', () => {
    timerService.updateSettings(30, 10, 20, 5);
    timerService.reset();
    expect(timerService.getWorkDuration()).toBe(30 * SECONDS_PER_MINUTE);
    expect(timerService['timeLeft']).toBe(30 * SECONDS_PER_MINUTE);
    expect(timerService.getCurrentSession()).toBe(SessionType.Work);
  });
});