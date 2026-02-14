import { UrdUIDOMHandler } from '../../../src/components/urd-timer/UrdUIDOMHandler';
import { UrdTimerService } from '../../../src/components/urd-timer/UrdTimerService';
import { UrdSettingsManager } from '../../../src/components/urd-timer/UrdSettingsManager';
import { MockMessageService, MockStorageService } from '../../mocks/serviceMocks';

describe('UrdUIDOMHandler', () => {
  let shadowRoot: ShadowRoot;
  let timerService: UrdTimerService;
  let domHandler: UrdUIDOMHandler;

  beforeEach(() => {
    // Create a container element with shadow root
    const container = document.createElement('div');
    document.body.appendChild(container);
    shadowRoot = container.attachShadow({ mode: 'open' });

    // Create mock timer service
    const mockMessageService = new MockMessageService();
    const mockStorageService = new MockStorageService();
    const settingsManager = new UrdSettingsManager(mockStorageService);
    timerService = new UrdTimerService(settingsManager, mockMessageService);

    // Create DOM handler
    domHandler = new UrdUIDOMHandler(shadowRoot, timerService);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('initializeDOMElements', () => {
    it('should initialize all input elements when they exist', () => {
      // Setup DOM
      shadowRoot.innerHTML = `
        <input id="work-duration" value="25" />
        <input id="short-break-duration" value="5" />
        <input id="long-break-duration" value="15" />
        <input id="short-breaks-before-long" value="4" />
        <button id="save-settings">Save</button>
      `;

      domHandler.initializeDOMElements();

      // Verify all elements are found
      const workInput = shadowRoot.querySelector('#work-duration');
      const shortBreakInput = shadowRoot.querySelector('#short-break-duration');
      const longBreakInput = shadowRoot.querySelector('#long-break-duration');
      const shortBreaksInput = shadowRoot.querySelector('#short-breaks-before-long');
      const saveButton = shadowRoot.querySelector('#save-settings');

      expect(workInput).toBeTruthy();
      expect(shortBreakInput).toBeTruthy();
      expect(longBreakInput).toBeTruthy();
      expect(shortBreaksInput).toBeTruthy();
      expect(saveButton).toBeTruthy();
    });

    it('should handle missing elements gracefully', () => {
      shadowRoot.innerHTML = ''; // Empty DOM

      // Should not throw error
      expect(() => domHandler.initializeDOMElements()).not.toThrow();
    });

    it('should handle partial DOM elements', () => {
      shadowRoot.innerHTML = `
        <input id="work-duration" value="25" />
        <button id="save-settings">Save</button>
      `;

      expect(() => domHandler.initializeDOMElements()).not.toThrow();
    });
  });

  describe('addSettingsEventListeners', () => {
    it('should add click listener to save settings button', () => {
      shadowRoot.innerHTML = `
        <input id="work-duration" value="30" />
        <input id="short-break-duration" value="10" />
        <input id="long-break-duration" value="20" />
        <input id="short-breaks-before-long" value="3" />
        <button id="save-settings">Save</button>
      `;

      domHandler.initializeDOMElements();

      const updateSettingsSpy = jest.spyOn(timerService, 'updateSettings');

      domHandler.addSettingsEventListeners();

      const saveButton = shadowRoot.querySelector('#save-settings') as HTMLButtonElement;
      saveButton.click();

      expect(updateSettingsSpy).toHaveBeenCalledWith(30, 10, 20, 3);
    });

    it('should use default values for invalid input', () => {
      shadowRoot.innerHTML = `
        <input id="work-duration" value="invalid" />
        <input id="short-break-duration" value="" />
        <input id="long-break-duration" value="abc" />
        <input id="short-breaks-before-long" value="xyz" />
        <button id="save-settings">Save</button>
      `;

      domHandler.initializeDOMElements();

      const updateSettingsSpy = jest.spyOn(timerService, 'updateSettings');

      domHandler.addSettingsEventListeners();

      const saveButton = shadowRoot.querySelector('#save-settings') as HTMLButtonElement;
      saveButton.click();

      // Should use default values
      expect(updateSettingsSpy).toHaveBeenCalledWith(25, 5, 15, 4);
    });

    it('should handle missing save button gracefully', () => {
      shadowRoot.innerHTML = `
        <input id="work-duration" value="25" />
      `;

      domHandler.initializeDOMElements();

      // Should not throw error when button is missing
      expect(() => domHandler.addSettingsEventListeners()).not.toThrow();
    });

    it('should handle missing input elements by using defaults', () => {
      shadowRoot.innerHTML = `
        <button id="save-settings">Save</button>
      `;

      domHandler.initializeDOMElements();

      const updateSettingsSpy = jest.spyOn(timerService, 'updateSettings');

      domHandler.addSettingsEventListeners();

      const saveButton = shadowRoot.querySelector('#save-settings') as HTMLButtonElement;
      saveButton.click();

      // Should use all default values when inputs are missing
      expect(updateSettingsSpy).toHaveBeenCalledWith(25, 5, 15, 4);
    });
  });

  describe('addButtonListeners', () => {
    it('should add event listeners to start/stop and reset buttons', () => {
      shadowRoot.innerHTML = `
        <button id="start-stop">Start</button>
        <button id="reset">Reset</button>
      `;

      const toggleCallback = jest.fn();
      const resetCallback = jest.fn();

      domHandler.addButtonListeners(toggleCallback, resetCallback);

      const startStopButton = shadowRoot.querySelector('#start-stop') as HTMLButtonElement;
      const resetButton = shadowRoot.querySelector('#reset') as HTMLButtonElement;

      startStopButton.click();
      expect(toggleCallback).toHaveBeenCalledTimes(1);

      resetButton.click();
      expect(resetCallback).toHaveBeenCalledTimes(1);
    });

    it('should handle missing buttons and log error', () => {
      shadowRoot.innerHTML = ''; // No buttons

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const toggleCallback = jest.fn();
      const resetCallback = jest.fn();

      domHandler.addButtonListeners(toggleCallback, resetCallback);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Buttons not found in the shadow DOM');

      consoleErrorSpy.mockRestore();
    });

    it('should handle only start-stop button present', () => {
      shadowRoot.innerHTML = `<button id="start-stop">Start</button>`;

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const toggleCallback = jest.fn();
      const resetCallback = jest.fn();

      domHandler.addButtonListeners(toggleCallback, resetCallback);

      // Should log error because reset button is missing
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should handle only reset button present', () => {
      shadowRoot.innerHTML = `<button id="reset">Reset</button>`;

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const toggleCallback = jest.fn();
      const resetCallback = jest.fn();

      domHandler.addButtonListeners(toggleCallback, resetCallback);

      // Should log error because start-stop button is missing
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should allow multiple clicks on buttons', () => {
      shadowRoot.innerHTML = `
        <button id="start-stop">Start</button>
        <button id="reset">Reset</button>
      `;

      const toggleCallback = jest.fn();
      const resetCallback = jest.fn();

      domHandler.addButtonListeners(toggleCallback, resetCallback);

      const startStopButton = shadowRoot.querySelector('#start-stop') as HTMLButtonElement;
      const resetButton = shadowRoot.querySelector('#reset') as HTMLButtonElement;

      // Multiple clicks
      startStopButton.click();
      startStopButton.click();
      startStopButton.click();

      resetButton.click();
      resetButton.click();

      expect(toggleCallback).toHaveBeenCalledTimes(3);
      expect(resetCallback).toHaveBeenCalledTimes(2);
    });
  });

  describe('integration', () => {
    it('should handle complete workflow: initialize, add listeners, interact', () => {
      shadowRoot.innerHTML = `
        <input id="work-duration" value="45" />
        <input id="short-break-duration" value="7" />
        <input id="long-break-duration" value="18" />
        <input id="short-breaks-before-long" value="5" />
        <button id="save-settings">Save</button>
        <button id="start-stop">Start</button>
        <button id="reset">Reset</button>
      `;

      const updateSettingsSpy = jest.spyOn(timerService, 'updateSettings');
      const toggleCallback = jest.fn();
      const resetCallback = jest.fn();

      // Initialize
      domHandler.initializeDOMElements();

      // Add listeners
      domHandler.addSettingsEventListeners();
      domHandler.addButtonListeners(toggleCallback, resetCallback);

      // Interact
      const saveButton = shadowRoot.querySelector('#save-settings') as HTMLButtonElement;
      const startStopButton = shadowRoot.querySelector('#start-stop') as HTMLButtonElement;
      const resetButton = shadowRoot.querySelector('#reset') as HTMLButtonElement;

      saveButton.click();
      expect(updateSettingsSpy).toHaveBeenCalledWith(45, 7, 18, 5);

      startStopButton.click();
      expect(toggleCallback).toHaveBeenCalledTimes(1);

      resetButton.click();
      expect(resetCallback).toHaveBeenCalledTimes(1);
    });

    it('should handle re-initialization', () => {
      shadowRoot.innerHTML = `
        <input id="work-duration" value="25" />
        <button id="save-settings">Save</button>
      `;

      // First initialization
      domHandler.initializeDOMElements();

      // Change DOM
      shadowRoot.innerHTML = `
        <input id="work-duration" value="50" />
        <button id="save-settings">Save</button>
      `;

      // Re-initialize
      domHandler.initializeDOMElements();

      const updateSettingsSpy = jest.spyOn(timerService, 'updateSettings');
      domHandler.addSettingsEventListeners();

      const saveButton = shadowRoot.querySelector('#save-settings') as HTMLButtonElement;
      saveButton.click();

      // Should use new value
      expect(updateSettingsSpy).toHaveBeenCalledWith(50, 5, 15, 4);
    });
  });
});
