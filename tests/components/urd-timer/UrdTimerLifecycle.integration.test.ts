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

  beforeEach(() => {
    if (typeof CSSStyleSheet.prototype.replace === 'undefined') {
      CSSStyleSheet.prototype.replace = jest.fn().mockResolvedValue(undefined);
    }
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
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
});
