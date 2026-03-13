import { WebPageMessageService } from '../../src/services/WebPageMessageService';

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('WebPageMessageService', () => {
  let webPageMessageService: WebPageMessageService;
  let mockAppendChild: jest.SpyInstance;
  let mockCreateElement: jest.SpyInstance;

  beforeEach(() => {
    // Mock DOM methods
    mockAppendChild = jest.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
    mockCreateElement = jest.spyOn(document, 'createElement').mockImplementation(
      () =>
        ({
          style: {},
          textContent: '',
        }) as unknown as HTMLElement
    );

    // Mock Notification API
    const mockNotification = jest.fn();
    (mockNotification as any).permission = 'default';
    (mockNotification as any).requestPermission = jest.fn().mockResolvedValue('granted');
    (window as any).Notification = mockNotification;

    // Create a new instance of WebPageMessageService for each test
    webPageMessageService = new WebPageMessageService();
  });

  afterEach(() => {
    // Restore all mocks after each test
    jest.restoreAllMocks();
    delete (window as any).Notification;
  });

  test('createMessageElement creates and adds a message element', () => {
    expect(mockCreateElement).toHaveBeenCalledWith('div');
    expect(mockAppendChild).toHaveBeenCalled();
  });

  test('showMessage displays the message and hides it after 3 seconds', () => {
    (window as any).Notification.permission = 'granted';
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

  test('should request notification permission on construction', () => {
    expect((window as any).Notification.requestPermission).toHaveBeenCalled();
  });

  test('should show browser notification when permission is granted', () => {
    (window as any).Notification.permission = 'granted';
    (window as any).Notification.mockClear();

    webPageMessageService.showMessage('Dags att arbeta!');

    expect((window as any).Notification).toHaveBeenCalledWith('Urd Timekeeper', {
      body: 'Dags att arbeta!',
      icon: '/favicon.svg',
    });
  });

  test('should not show browser notification when permission is denied', () => {
    (window as any).Notification.permission = 'denied';
    (window as any).Notification.mockClear();

    webPageMessageService.showMessage('Test');

    expect((window as any).Notification).not.toHaveBeenCalled();
  });

  test('should not request permission when already granted', () => {
    (window as any).Notification.permission = 'granted';
    (window as any).Notification.requestPermission.mockClear();

    // Create a new instance — should skip requesting
    const service = new WebPageMessageService();
    expect((window as any).Notification.requestPermission).not.toHaveBeenCalled();
    // Suppress unused variable warning
    expect(service).toBeDefined();
  });

  test('should show UI hint when notifications are denied at startup', () => {
    (window as any).Notification.permission = 'denied';

    const service = new WebPageMessageService();

    expect(service['messageElement']?.textContent).toContain('Webblasarnotiser ar avstangda');
  });

  test('should show UI hint when permission request is denied', async () => {
    (window as any).Notification.permission = 'default';
    (window as any).Notification.requestPermission = jest.fn().mockResolvedValue('denied');

    const service = new WebPageMessageService();
    await flushPromises();

    expect(service['messageElement']?.textContent).toContain('Webblasarnotiser nekades');
  });

  test('should show UI hint when permission remains default during notification', () => {
    (window as any).Notification.permission = 'default';
    (window as any).Notification.requestPermission = jest.fn(
      () => new Promise<NotificationPermission>(() => {})
    );

    const service = new WebPageMessageService();
    service.showMessage('Test');

    expect(service['messageElement']?.textContent).toContain(
      'Webblasarnotiser ar inte aktiverade an'
    );
    expect(service['hasShownNotificationHint']).toBe(true);
  });
});
