import { UrdKeyboardShortcutService } from '../../../src/components/urd-timer/UrdKeyboardShortcutService';
import { UrdTimerService } from '../../../src/components/urd-timer/UrdTimerService';

describe('UrdKeyboardShortcutService', () => {
  let keyboardService: UrdKeyboardShortcutService;
  let mockTimerService: jest.Mocked<UrdTimerService>;

  beforeEach(() => {
    mockTimerService = {
      toggle: jest.fn(),
    } as any;

    keyboardService = new UrdKeyboardShortcutService(mockTimerService);
  });

  afterEach(() => {
    // Clean up any event listeners
    keyboardService.removeKeyboardListener();
  });

  describe('addKeyboardListener', () => {
    test('should call toggle when Space key is pressed', () => {
      keyboardService.addKeyboardListener();

      const event = new KeyboardEvent('keydown', { key: ' ' });
      document.dispatchEvent(event);

      expect(mockTimerService.toggle).toHaveBeenCalled();
    });

    test('should call toggle when Space code is pressed', () => {
      keyboardService.addKeyboardListener();

      const event = new KeyboardEvent('keydown', { code: 'Space' });
      document.dispatchEvent(event);

      expect(mockTimerService.toggle).toHaveBeenCalled();
    });

    test('should prevent default behavior for Space key', () => {
      keyboardService.addKeyboardListener();

      const event = new KeyboardEvent('keydown', { key: ' ' });
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

      document.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    test('should not call toggle for other keys', () => {
      keyboardService.addKeyboardListener();

      const event = new KeyboardEvent('keydown', { key: 'a' });
      document.dispatchEvent(event);

      expect(mockTimerService.toggle).not.toHaveBeenCalled();
    });

    test('should not crash when adding listener multiple times', () => {
      expect(() => {
        keyboardService.addKeyboardListener();
        keyboardService.addKeyboardListener();
      }).not.toThrow();
    });
  });

  describe('removeKeyboardListener', () => {
    test('should stop calling toggle after removal', () => {
      keyboardService.addKeyboardListener();
      keyboardService.removeKeyboardListener();

      const event = new KeyboardEvent('keydown', { key: ' ' });
      document.dispatchEvent(event);

      expect(mockTimerService.toggle).not.toHaveBeenCalled();
    });

    test('should not crash when called without adding listener first', () => {
      expect(() => keyboardService.removeKeyboardListener()).not.toThrow();
    });

    test('should not crash when called multiple times', () => {
      keyboardService.addKeyboardListener();

      expect(() => {
        keyboardService.removeKeyboardListener();
        keyboardService.removeKeyboardListener();
      }).not.toThrow();
    });

    test('should allow re-adding listener after removal', () => {
      keyboardService.addKeyboardListener();
      keyboardService.removeKeyboardListener();
      keyboardService.addKeyboardListener();

      const event = new KeyboardEvent('keydown', { key: ' ' });
      document.dispatchEvent(event);

      expect(mockTimerService.toggle).toHaveBeenCalledTimes(1);
    });
  });
});
