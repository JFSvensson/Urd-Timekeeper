import { SessionType } from '../../src/components/urd-timer/UrdSessionType';

export class MockStorageService {
  private storage: { [key: string]: string } = {};

  getItem(key: string): string | null {
    return this.storage[key] || null;
  }

  setItem(key: string, value: string): void {
    this.storage[key] = value;
  }

  removeItem(key: string): void {
    delete this.storage[key];
  }
}

export class MockMessageService {
  showMessage(_message: string): void {
    // Implementera vid behov, t.ex. console.log(message);
  }
}

export class MockAudioService {
  private muted = false;
  playNotification = jest.fn((_sessionType: SessionType) => {});
  playAmbient = jest.fn();
  stopAmbient = jest.fn();
  setVolume = jest.fn();
  setMuted = jest.fn((m: boolean) => {
    this.muted = m;
  });
  isMuted = jest.fn(() => this.muted);
}
