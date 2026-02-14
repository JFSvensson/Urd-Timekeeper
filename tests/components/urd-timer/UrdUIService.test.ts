import { UrdUIService } from '../../../src/components/urd-timer/UrdUIService';
import { UrdTimerService } from '../../../src/components/urd-timer/UrdTimerService';
import { UrdUIRenderer } from '../../../src/components/urd-timer/UrdUIRenderer';
import { UrdUIDOMHandler } from '../../../src/components/urd-timer/UrdUIDOMHandler';
import { UrdSettingsManager } from '../../../src/components/urd-timer/UrdSettingsManager';
import { SECONDS_PER_MINUTE, DEFAULT_WORK_DURATION } from '../../../src/components/urd-timer/UrdConstants';
import { MockStorageService, MockMessageService } from '../../mocks/serviceMocks';

describe('UrdUIService', () => {
  let shadowRoot: ShadowRoot;
  let timerService: UrdTimerService;
  let uiService: UrdUIService;
  let mockRenderer: jest.Mocked<UrdUIRenderer>;
  let mockDomHandler: jest.Mocked<UrdUIDOMHandler>;

  beforeEach(() => {
    // Mock CSSStyleSheet.replace for jsdom compatibility
    if (typeof CSSStyleSheet.prototype.replace === 'undefined') {
      CSSStyleSheet.prototype.replace = jest.fn().mockResolvedValue(undefined);
    }

    const container = document.createElement('div');
    document.body.appendChild(container);
    shadowRoot = container.attachShadow({ mode: 'open' });

    // Set up the DOM the services expect
    shadowRoot.innerHTML = `
      <div id="timer-container">
        <svg class="progress-ring" width="300" height="300" viewBox="0 0 300 300">
          <circle class="progress-ring__circle-bg" stroke="#e0e0e0" stroke-width="10"
            fill="transparent" r="140" cx="150" cy="150" />
          <circle class="progress-ring__circle" stroke="#4CAF50" stroke-width="10"
            fill="transparent" r="140" cx="150" cy="150" stroke-linecap="round" />
        </svg>
        <div class="timer-content">
          <div id="session-info"></div>
          <div id="time-display">25:00</div>
        </div>
      </div>
      <button id="start-stop">Start</button>
      <button id="reset">Reset</button>
      <div class="settings">
        <input type="number" id="work-duration" value="25">
        <input type="number" id="short-break-duration" value="5">
        <input type="number" id="long-break-duration" value="15">
        <input type="number" id="short-breaks-before-long" value="4">
        <button id="save-settings">Save Settings</button>
      </div>
    `;

    const mockStorageService = new MockStorageService();
    const mockMessageService = new MockMessageService();
    const settingsManager = new UrdSettingsManager(mockStorageService);
    timerService = new UrdTimerService(settingsManager, mockMessageService);

    mockRenderer = {
      render: jest.fn().mockResolvedValue(undefined),
      renderKeyboardShortcutInfo: jest.fn()
    } as any;

    mockDomHandler = {
      initializeDOMElements: jest.fn(),
      addButtonListeners: jest.fn(),
      addSettingsEventListeners: jest.fn()
    } as any;

    uiService = new UrdUIService(shadowRoot, timerService, mockRenderer, mockDomHandler);
  });

  afterEach(() => {
    uiService.removeKeyboardListener();
    document.body.innerHTML = '';
  });

  describe('constructor', () => {
    it('should set INITIAL_TIME_LEFT from timerService.getWorkDuration()', async () => {
      // getWorkDuration() returns seconds (25 * 60 = 1500)
      // The initial update() call uses this value
      const updateSpy = jest.spyOn(uiService, 'update');
      await uiService.initialize();

      // update should be called with workDuration in seconds, not double-multiplied
      expect(updateSpy).toHaveBeenCalledWith(
        DEFAULT_WORK_DURATION * SECONDS_PER_MINUTE,
        false
      );
    });
  });

  describe('initialize', () => {
    it('should call renderer.render()', async () => {
      await uiService.initialize();
      expect(mockRenderer.render).toHaveBeenCalled();
    });

    it('should call domHandler.initializeDOMElements()', async () => {
      await uiService.initialize();
      expect(mockDomHandler.initializeDOMElements).toHaveBeenCalled();
    });

    it('should set up the progress ring', async () => {
      await uiService.initialize();
      // Progress ring setup modifies SVG attributes
      const circle = shadowRoot.querySelector('.progress-ring__circle');
      expect(circle?.getAttribute('stroke-dasharray')).toBeTruthy();
    });

    it('should call update with initial values after setup', async () => {
      const updateSpy = jest.spyOn(uiService, 'update');
      await uiService.initialize();
      expect(updateSpy).toHaveBeenCalledWith(
        DEFAULT_WORK_DURATION * SECONDS_PER_MINUTE,
        false
      );
    });
  });

  describe('update', () => {
    beforeEach(async () => {
      await uiService.initialize();
    });

    it('should update time display', () => {
      uiService.update(1500, false);
      const display = shadowRoot.querySelector('#time-display');
      expect(display?.textContent).toBe('25:00');
    });

    it('should update time display with partial time', () => {
      uiService.update(90, false);
      const display = shadowRoot.querySelector('#time-display');
      expect(display?.textContent).toBe('01:30');
    });

    it('should update start/stop button text when running', () => {
      uiService.update(1500, true);
      const button = shadowRoot.querySelector('#start-stop');
      expect(button?.textContent).toBe('Pause');
    });

    it('should update start/stop button text when paused', () => {
      uiService.update(1500, false);
      const button = shadowRoot.querySelector('#start-stop');
      expect(button?.textContent).toBe('Start');
    });

    it('should update session info', () => {
      uiService.update(1500, false);
      const sessionInfo = shadowRoot.querySelector('#session-info');
      expect(sessionInfo?.textContent).toContain('Arbete');
    });

    it('should update progress ring', () => {
      uiService.update(750, false);
      const circle = shadowRoot.querySelector('.progress-ring__circle');
      const offset = circle?.getAttribute('stroke-dashoffset');
      expect(offset).toBeTruthy();
      expect(Number(offset)).not.toBe(0);
    });
  });

  describe('removeKeyboardListener', () => {
    it('should remove keyboard listener without error', async () => {
      await uiService.initialize();
      expect(() => uiService.removeKeyboardListener()).not.toThrow();
    });

    it('should prevent space key from toggling after removal', async () => {
      await uiService.initialize();
      uiService.removeKeyboardListener();

      const toggleSpy = jest.spyOn(timerService, 'toggle');
      document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
      expect(toggleSpy).not.toHaveBeenCalled();
    });
  });

  describe('addButtonListeners', () => {
    it('should delegate to domHandler', () => {
      const toggleFn = jest.fn();
      const resetFn = jest.fn();

      uiService.addButtonListeners(toggleFn, resetFn);
      expect(mockDomHandler.addButtonListeners).toHaveBeenCalledWith(toggleFn, resetFn);
    });
  });

  describe('addSettingsEventListeners', () => {
    it('should delegate to domHandler', () => {
      uiService.addSettingsEventListeners();
      expect(mockDomHandler.addSettingsEventListeners).toHaveBeenCalled();
    });
  });

  describe('observer pattern', () => {
    it('should implement UrdTimerObserver interface', () => {
      expect(typeof uiService.update).toBe('function');
    });

    it('should receive updates from timer service', async () => {
      jest.useFakeTimers();
      await uiService.initialize();

      timerService.addObserver(uiService);
      const updateSpy = jest.spyOn(uiService, 'update');

      timerService.toggle();
      jest.advanceTimersByTime(1000);

      expect(updateSpy).toHaveBeenCalled();

      timerService.toggle(); // stop
      jest.useRealTimers();
    });
  });
});
