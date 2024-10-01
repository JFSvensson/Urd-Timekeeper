import { UrdTimer } from '../../../src/components/urd-timer/UrdTimer';
import { UrdTimerService } from '../../../src/components/urd-timer/UrdTimerService';
import { UrdUIService } from '../../../src/components/urd-timer/UrdUIService';
import { BrowserStorageService } from '../../../src/services/BrowserStorageService';
import { WebPageMessageService } from '../../../src/services/WebPageMessageService';
import { ResourceLoader } from '../../../src/services/ResourceLoader';

jest.mock('../../../src/components/urd-timer/UrdTimerService');

jest.mock('../../../src/components/urd-timer/UrdUIService', () => {
  return {
    UrdUIService: jest.fn().mockImplementation((_shadowRoot, _timerService, resourceLoader) => ({
      render: jest.fn().mockImplementation(async () => {
        await resourceLoader.fetchResource('./UrdTimer.css');
        await resourceLoader.fetchResource('./UrdTimer.html');
      }),
      addButtonListeners: jest.fn()
    }))
  };
});

jest.mock('../../../src/services/BrowserStorageService');
jest.mock('../../../src/services/WebPageMessageService');

jest.mock('../../../src/services/ResourceLoader', () => {
  return {
    ResourceLoader: jest.fn().mockImplementation(() => ({
      fetchResource: jest.fn().mockImplementation(async (url: string) => {
        console.log(`Mocking fetch for: ${url}`);
        if (url.endsWith('.css')) {
          return 'mocked-css-content';
        } else if (url.endsWith('.html')) {
          return '<div>mocked-html-content</div>';
        }
        throw new Error('Unknown resource');
      })
    }))
  };
});

describe('UrdTimer', () => {
  let timer: UrdTimer;
  let mockTimerService: jest.Mocked<UrdTimerService>;
  let mockUIService: jest.Mocked<UrdUIService>;
  let mockStorageService: jest.Mocked<BrowserStorageService>;
  let mockMessageService: jest.Mocked<WebPageMessageService>;
  let mockResourceLoader: jest.Mocked<ResourceLoader>;

  beforeEach(() => {
    mockStorageService = jest.mocked(new BrowserStorageService());
    mockMessageService = jest.mocked(new WebPageMessageService());
    mockResourceLoader = jest.mocked(new ResourceLoader());
  
    mockTimerService = jest.mocked(new UrdTimerService(mockStorageService, mockMessageService));
    mockUIService = jest.mocked(new UrdUIService(null, mockTimerService, mockResourceLoader));
  
    (UrdTimerService as jest.MockedClass<typeof UrdTimerService>).mockImplementation(() => mockTimerService);
    (UrdUIService as jest.MockedClass<typeof UrdUIService>).mockImplementation(() => mockUIService);
  
    timer = new UrdTimer(mockStorageService, mockMessageService, mockResourceLoader);
  });

  test('should initialize correctly', () => {
    expect(timer).toBeDefined();
    expect(UrdTimerService).toHaveBeenCalled();
    expect(UrdUIService).toHaveBeenCalled();
    expect(mockTimerService.addObserver).toHaveBeenCalledWith(mockUIService);
  });

  test('should render UI and load settings on connectedCallback', async () => {
    await timer.connectedCallback();
    expect(mockUIService.render).toHaveBeenCalled();
    expect(mockTimerService.loadSettings).toHaveBeenCalled();
  });

  test('should add event listeners on connectedCallback', async () => {
    await timer.connectedCallback();
    expect(mockUIService.addButtonListeners).toHaveBeenCalled();
  });

  // test('should load resources correctly', async () => {
  //   await timer.connectedCallback();
  
  //   expect(mockUIService.render).toHaveBeenCalled();    
  
  //   // Verifiera att fetchResource har anropats för både CSS och HTML
  //   expect(mockResourceLoader.fetchResource).toHaveBeenCalledTimes(2);
  //   expect(mockResourceLoader.fetchResource).toHaveBeenCalledWith('./UrdTimer.css');
  //   expect(mockResourceLoader.fetchResource).toHaveBeenCalledWith('./UrdTimer.html');
  // });
});