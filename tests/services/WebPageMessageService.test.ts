import { WebPageMessageService } from '../../src/services/WebPageMessageService';

describe('WebPageMessageService', () => {
  let webPageMessageService: WebPageMessageService;
  let mockAppendChild: jest.SpyInstance;
  let mockCreateElement: jest.SpyInstance;

  beforeEach(() => {
    // Mock DOM methods
    mockAppendChild = jest.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
    mockCreateElement = jest.spyOn(document, 'createElement').mockImplementation(() => ({
      style: {},
      textContent: '',
    } as unknown as HTMLElement));

    // Create a new instance of WebPageMessageService for each test
    webPageMessageService = new WebPageMessageService();
  });

  afterEach(() => {
    // Restore all mocks after each test
    jest.restoreAllMocks();
  });

  test('createMessageElement creates and adds a message element', () => {
    expect(mockCreateElement).toHaveBeenCalledWith('div');
    expect(mockAppendChild).toHaveBeenCalled();
  });

  test('showMessage displays the message and hides it after 3 seconds', () => {
    jest.useFakeTimers();

    const testMessage = 'Test message';
    webPageMessageService.showMessage(testMessage);

    // Check that the message is displayed correctly
    expect(webPageMessageService['messageElement']?.textContent).toBe(testMessage);
    expect(webPageMessageService['messageElement']?.style.display).toBe('block');

    // Advance time by 3 seconds
    jest.advanceTimersByTime(3000);

    // Check that the message has been hidden
    expect(webPageMessageService['messageElement']?.style.display).toBe('none');

    jest.useRealTimers();
  });

  test('showMessage handles null messageElement', () => {
    // Simulate a situation where messageElement is null
    webPageMessageService['messageElement'] = null;

    // This should not throw any error
    expect(() => webPageMessageService.showMessage('Test')).not.toThrow();
  });
});
