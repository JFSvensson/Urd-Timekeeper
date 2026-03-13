import { UrdTimerDisplayService } from '../../../src/components/urd-timer/UrdTimerDisplayService';

describe('UrdTimerDisplayService', () => {
  let displayService: UrdTimerDisplayService;
  let mockShadowRoot: ShadowRoot;
  let timeDisplay: HTMLElement;
  let startStopButton: HTMLElement;
  let sessionInfo: HTMLElement;
  let sessionStats: HTMLElement;

  beforeEach(() => {
    // Create mock DOM elements
    timeDisplay = document.createElement('div');
    timeDisplay.id = 'time-display';

    startStopButton = document.createElement('button');
    startStopButton.id = 'start-stop';

    sessionInfo = document.createElement('div');
    sessionInfo.id = 'session-info';

    sessionStats = document.createElement('div');
    sessionStats.id = 'session-stats';

    // Create mock shadow root
    mockShadowRoot = {
      querySelector: jest.fn((selector: string) => {
        if (selector === '#time-display') return timeDisplay;
        if (selector === '#start-stop') return startStopButton;
        if (selector === '#session-info') return sessionInfo;
        if (selector === '#session-stats') return sessionStats;
        return null;
      }),
    } as any;

    displayService = new UrdTimerDisplayService(mockShadowRoot);
  });

  describe('updateDisplay', () => {
    test('should format time correctly for whole minutes', () => {
      displayService.updateDisplay(300); // 5 minutes
      expect(timeDisplay.textContent).toBe('05:00');
    });

    test('should format time correctly with seconds', () => {
      displayService.updateDisplay(125); // 2 minutes 5 seconds
      expect(timeDisplay.textContent).toBe('02:05');
    });

    test('should pad single digits with zeros', () => {
      displayService.updateDisplay(65); // 1 minute 5 seconds
      expect(timeDisplay.textContent).toBe('01:05');
    });

    test('should handle zero time', () => {
      displayService.updateDisplay(0);
      expect(timeDisplay.textContent).toBe('00:00');
    });

    test('should handle double-digit minutes and seconds', () => {
      displayService.updateDisplay(665); // 11 minutes 5 seconds
      expect(timeDisplay.textContent).toBe('11:05');
    });

    test('should not crash if time display element is not found', () => {
      mockShadowRoot.querySelector = jest.fn(() => null);
      expect(() => displayService.updateDisplay(100)).not.toThrow();
    });
  });

  describe('updateStartStopButton', () => {
    test('should show "Paus" when running', () => {
      displayService.updateStartStopButton(true);
      expect(startStopButton.textContent).toBe('Paus');
    });

    test('should show "Start" when not running', () => {
      displayService.updateStartStopButton(false);
      expect(startStopButton.textContent).toBe('Start');
    });

    test('should not crash if button element is not found', () => {
      mockShadowRoot.querySelector = jest.fn(() => null);
      expect(() => displayService.updateStartStopButton(true)).not.toThrow();
    });
  });

  describe('updateSessionInfo', () => {
    test('should display work session info correctly', () => {
      displayService.updateSessionInfo('work', 3);
      expect(sessionInfo.textContent).toBe('Arbete · Pomodoros: 3');
    });

    test('should display short break session info correctly', () => {
      displayService.updateSessionInfo('shortBreak', 2);
      expect(sessionInfo.textContent).toBe('Kort paus · Pomodoros: 2');
    });

    test('should display long break session info correctly', () => {
      displayService.updateSessionInfo('longBreak', 4);
      expect(sessionInfo.textContent).toBe('Lång paus · Pomodoros: 4');
    });

    test('should display zero pomodoros correctly', () => {
      displayService.updateSessionInfo('work', 0);
      expect(sessionInfo.textContent).toBe('Arbete · Pomodoros: 0');
    });

    test('should not crash if session info element is not found', () => {
      mockShadowRoot.querySelector = jest.fn(() => null);
      expect(() => displayService.updateSessionInfo('work', 5)).not.toThrow();
    });
  });

  describe('updateStats', () => {
    test('should render stat cards with correct values', () => {
      displayService.updateStats({ today: 3, thisWeek: 12, allTime: 50 });

      expect(sessionStats.innerHTML).toContain('3');
      expect(sessionStats.innerHTML).toContain('12');
      expect(sessionStats.innerHTML).toContain('50');
      expect(sessionStats.innerHTML).toContain('Idag');
      expect(sessionStats.innerHTML).toContain('Denna vecka');
      expect(sessionStats.innerHTML).toContain('Totalt');
    });

    test('should render zeros correctly', () => {
      displayService.updateStats({ today: 0, thisWeek: 0, allTime: 0 });

      const values = sessionStats.querySelectorAll('.stat-value');
      expect(values).toHaveLength(3);
      values.forEach((v) => expect(v.textContent).toBe('0'));
    });

    test('should not crash if stats element is not found', () => {
      mockShadowRoot.querySelector = jest.fn(() => null);
      expect(() => displayService.updateStats({ today: 1, thisWeek: 2, allTime: 3 })).not.toThrow();
    });
  });
});
