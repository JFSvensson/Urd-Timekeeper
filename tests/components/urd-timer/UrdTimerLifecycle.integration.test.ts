import { UrdTimer } from '../../../src/components/urd-timer/UrdTimer';
import { UrdTimerService } from '../../../src/components/urd-timer/UrdTimerService';
import { StorageService } from '../../../src/services/StorageService';
import { MessageService } from '../../../src/services/MessageService';
import { AudioService } from '../../../src/services/AudioService';
import { SessionType } from '../../../src/components/urd-timer/UrdSessionType';

class MockStorageService implements StorageService {
  private store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }
}

class MockMessageService implements MessageService {
  showMessage(_message: string): void {}
}

class MockAudioService implements AudioService {
  playNotification(_sessionType: SessionType): void {}
  playAmbient(): void {}
  stopAmbient(): void {}
  setVolume(_volume: number): void {}
  setMuted(_muted: boolean): void {}
  isMuted(): boolean {
    return false;
  }
}

describe('UrdTimer lifecycle integration', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let originalReplace: unknown;

  beforeEach(() => {
    originalReplace = (CSSStyleSheet.prototype as any).replace;
    (CSSStyleSheet.prototype as any).replace = jest
      .fn()
      .mockResolvedValue(undefined as unknown as CSSStyleSheet);
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    if (typeof originalReplace === 'undefined') {
      delete (CSSStyleSheet.prototype as any).replace;
    } else {
      (CSSStyleSheet.prototype as any).replace = originalReplace;
    }
    consoleErrorSpy.mockRestore();
    jest.useRealTimers();
  });

  it('does not accumulate keyboard listeners across reconnect cycles', async () => {
    const toggleSpy = jest.spyOn(UrdTimerService.prototype, 'toggle');
    const timer = new UrdTimer(
      new MockStorageService(),
      new MockMessageService(),
      new MockAudioService()
    );

    for (let i = 0; i < 2; i++) {
      await timer.connectedCallback();
      timer.disconnectedCallback();
    }

    await timer.connectedCallback();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    expect(toggleSpy).toHaveBeenCalledTimes(1);

    timer.disconnectedCallback();
    toggleSpy.mockClear();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    expect(toggleSpy).not.toHaveBeenCalled();

    toggleSpy.mockRestore();
  });

  it('stops active countdown when component disconnects', async () => {
    jest.useFakeTimers();

    const timer = new UrdTimer(
      new MockStorageService(),
      new MockMessageService(),
      new MockAudioService()
    );

    await timer.connectedCallback();

    // Start timer through the same keyboard pathway users trigger.
    document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    jest.advanceTimersByTime(3000);

    const timerService = (timer as any).timerService as UrdTimerService;
    const beforeDisconnect = timerService.getTimeLeft();
    expect(timerService.getIsRunning()).toBe(true);

    timer.disconnectedCallback();

    expect(timerService.getIsRunning()).toBe(false);
    jest.advanceTimersByTime(5000);
    expect(timerService.getTimeLeft()).toBe(beforeDisconnect);
  });
});
