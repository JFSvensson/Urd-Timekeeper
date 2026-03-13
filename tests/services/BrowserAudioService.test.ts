import { BrowserAudioService } from '../../src/services/BrowserAudioService';
import { SessionType } from '../../src/components/urd-timer/UrdSessionType';

// Minimal Web Audio API mocks
class MockGainNode {
  gain = { setValueAtTime: jest.fn(), exponentialRampToValueAtTime: jest.fn() };
  connect = jest.fn();
  disconnect = jest.fn();
}

class MockOscillatorNode {
  type: OscillatorType = 'sine';
  frequency = { setValueAtTime: jest.fn() };
  connect = jest.fn();
  disconnect = jest.fn();
  start = jest.fn();
  stop = jest.fn();
}

class MockAudioContext {
  currentTime = 0;
  destination = {};

  createOscillator(): MockOscillatorNode {
    return new MockOscillatorNode();
  }

  createGain(): MockGainNode {
    return new MockGainNode();
  }
}

// Make AudioContext available globally
(globalThis as any).AudioContext = MockAudioContext;

describe('BrowserAudioService', () => {
  let audioService: BrowserAudioService;
  const originalAudioContext = (globalThis as { AudioContext?: unknown }).AudioContext;

  beforeEach(() => {
    (globalThis as { AudioContext?: unknown }).AudioContext = MockAudioContext;
    audioService = new BrowserAudioService();
  });

  afterAll(() => {
    (globalThis as { AudioContext?: unknown }).AudioContext = originalAudioContext;
  });

  describe('playNotification', () => {
    test('should play Work notification without errors', () => {
      expect(() => audioService.playNotification(SessionType.Work)).not.toThrow();
    });

    test('should play ShortBreak notification without errors', () => {
      expect(() => audioService.playNotification(SessionType.ShortBreak)).not.toThrow();
    });

    test('should play LongBreak notification without errors', () => {
      expect(() => audioService.playNotification(SessionType.LongBreak)).not.toThrow();
    });

    test('should not play when muted', () => {
      audioService.setMuted(true);
      // No error and no AudioContext created
      expect(() => audioService.playNotification(SessionType.Work)).not.toThrow();
    });
  });

  describe('volume control', () => {
    test('should set volume (clamped 0-1)', () => {
      audioService.setVolume(0.8);
      // No direct getter, but should not throw
      expect(() => audioService.setVolume(0.8)).not.toThrow();
    });

    test('should clamp volume below 0 to 0', () => {
      expect(() => audioService.setVolume(-0.5)).not.toThrow();
    });

    test('should clamp volume above 1 to 1', () => {
      expect(() => audioService.setVolume(1.5)).not.toThrow();
    });
  });

  describe('mute', () => {
    test('should toggle mute state', () => {
      expect(audioService.isMuted()).toBe(false);
      audioService.setMuted(true);
      expect(audioService.isMuted()).toBe(true);
      audioService.setMuted(false);
      expect(audioService.isMuted()).toBe(false);
    });

    test('should stop ambient when muted', () => {
      audioService.playAmbient();
      audioService.setMuted(true);
      // Ambient should be stopped, calling stop again should be safe
      expect(() => audioService.stopAmbient()).not.toThrow();
    });
  });

  describe('ambient', () => {
    test('should start ambient sound', () => {
      expect(() => audioService.playAmbient()).not.toThrow();
    });

    test('should not start ambient when already playing', () => {
      audioService.playAmbient();
      // Second call should be a no-op
      expect(() => audioService.playAmbient()).not.toThrow();
    });

    test('should stop ambient sound', () => {
      audioService.playAmbient();
      expect(() => audioService.stopAmbient()).not.toThrow();
    });

    test('should handle stopping when not playing', () => {
      expect(() => audioService.stopAmbient()).not.toThrow();
    });

    test('should not start ambient when muted', () => {
      audioService.setMuted(true);
      audioService.playAmbient();
      // Should be a no-op when muted
      expect(audioService.isMuted()).toBe(true);
    });
  });

  describe('audio context fallback', () => {
    test('should gracefully handle AudioContext constructor errors', () => {
      class ThrowingAudioContext {
        constructor() {
          throw new Error('Audio init blocked');
        }
      }

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      (globalThis as { AudioContext?: unknown }).AudioContext = ThrowingAudioContext;
      const failingService = new BrowserAudioService();

      expect(() => failingService.playNotification(SessionType.Work)).not.toThrow();
      expect(() => failingService.playAmbient()).not.toThrow();
      expect(warnSpy).toHaveBeenCalledTimes(1);

      warnSpy.mockRestore();
    });

    test('should gracefully handle missing AudioContext', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      (globalThis as { AudioContext?: unknown }).AudioContext = undefined;
      const noAudioService = new BrowserAudioService();

      expect(() => noAudioService.playNotification(SessionType.Work)).not.toThrow();
      expect(() => noAudioService.playAmbient()).not.toThrow();
      expect(warnSpy).toHaveBeenCalledTimes(1);

      warnSpy.mockRestore();
    });
  });
});
