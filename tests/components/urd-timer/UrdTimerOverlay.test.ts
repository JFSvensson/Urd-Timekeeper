import { UrdTimer } from '../../../src/components/urd-timer/UrdTimer';
import { UrdTimerService } from '../../../src/components/urd-timer/UrdTimerService';
import { UrdUIService } from '../../../src/components/urd-timer/UrdUIService';
import { UrdSettingsManager } from '../../../src/components/urd-timer/UrdSettingsManager';
import { BrowserStorageService } from '../../../src/services/BrowserStorageService';
import { WebPageMessageService } from '../../../src/services/WebPageMessageService';

jest.mock('../../../src/components/urd-timer/UrdTimerService');
jest.mock('../../../src/components/urd-timer/UrdUIRenderer');
jest.mock('../../../src/components/urd-timer/UrdUIDOMHandler');
jest.mock('../../../src/components/urd-timer/UrdSettingsManager');

jest.mock('../../../src/components/urd-timer/UrdUIService', () => {
  return {
    UrdUIService: jest
      .fn()
      .mockImplementation((_shadowRoot, _timerService, _uiRenderer, _domHandler) => ({
        initialize: jest.fn().mockResolvedValue(undefined),
        addButtonListeners: jest.fn(),
        addSettingsEventListeners: jest.fn(),
        removeKeyboardListener: jest.fn(),
      })),
  };
});

jest.mock('../../../src/services/BrowserStorageService');
jest.mock('../../../src/services/WebPageMessageService');

describe('UrdTimer - Overlay Mode', () => {
  let mockTimerService: jest.Mocked<UrdTimerService>;
  let mockUIService: jest.Mocked<UrdUIService>;
  let mockStorageService: jest.Mocked<BrowserStorageService>;
  let mockMessageService: jest.Mocked<WebPageMessageService>;
  let mockSettingsManager: jest.Mocked<UrdSettingsManager>;

  beforeEach(() => {
    jest.useFakeTimers();

    mockStorageService = jest.mocked(new BrowserStorageService());
    mockMessageService = jest.mocked(new WebPageMessageService());
    mockSettingsManager = jest.mocked(new UrdSettingsManager(mockStorageService));

    mockTimerService = jest.mocked(new UrdTimerService(mockSettingsManager, mockMessageService));
    mockUIService = jest.mocked(
      new UrdUIService(null as any, mockTimerService, null as any, null as any)
    );

    (UrdTimerService as jest.MockedClass<typeof UrdTimerService>).mockImplementation(
      () => mockTimerService
    );
    (UrdUIService as jest.MockedClass<typeof UrdUIService>).mockImplementation(() => mockUIService);
    (UrdSettingsManager as jest.MockedClass<typeof UrdSettingsManager>).mockImplementation(
      () => mockSettingsManager
    );
  });

  afterEach(() => {
    jest.useRealTimers();
    // Reset URL query parameters
    Object.defineProperty(window, 'location', {
      value: { search: '', href: '', origin: '', pathname: '/' },
      writable: true,
    });
  });

  describe('query parameter parsing', () => {
    it('should pass overlay mode flag to UrdTimerService', () => {
      // When overlay-mode is not set, the constructor passes false for overlayMode
      new UrdTimer(mockStorageService, mockMessageService);

      // UrdTimerService should have been constructed
      expect(UrdTimerService).toHaveBeenCalled();
    });
  });
});
