import { BrowserStorageService } from '../../src/services/BrowserStorageService';

describe('BrowserStorageService', () => {
  let storageService: BrowserStorageService;

  beforeEach(() => {
    localStorage.clear();
    storageService = new BrowserStorageService();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('setItem', () => {
    it('should store a value in localStorage', () => {
      storageService.setItem('testKey', 'testValue');
      expect(localStorage.getItem('testKey')).toBe('testValue');
    });

    it('should overwrite existing values', () => {
      storageService.setItem('testKey', 'first');
      storageService.setItem('testKey', 'second');
      expect(localStorage.getItem('testKey')).toBe('second');
    });

    it('should handle empty string values', () => {
      storageService.setItem('testKey', '');
      expect(localStorage.getItem('testKey')).toBe('');
    });

    it('should store JSON strings', () => {
      const json = JSON.stringify({ work: 25, break: 5 });
      storageService.setItem('settings', json);
      expect(localStorage.getItem('settings')).toBe(json);
    });
  });

  describe('getItem', () => {
    it('should retrieve a stored value', () => {
      localStorage.setItem('testKey', 'testValue');
      expect(storageService.getItem('testKey')).toBe('testValue');
    });

    it('should return null for non-existent keys', () => {
      expect(storageService.getItem('nonExistent')).toBeNull();
    });

    it('should handle empty string values', () => {
      localStorage.setItem('testKey', '');
      expect(storageService.getItem('testKey')).toBe('');
    });
  });

  describe('removeItem', () => {
    it('should remove a stored value', () => {
      localStorage.setItem('testKey', 'testValue');
      storageService.removeItem('testKey');
      expect(localStorage.getItem('testKey')).toBeNull();
    });

    it('should not throw for non-existent keys', () => {
      expect(() => storageService.removeItem('nonExistent')).not.toThrow();
    });
  });

  describe('integration', () => {
    it('should round-trip values correctly', () => {
      storageService.setItem('key', 'value');
      expect(storageService.getItem('key')).toBe('value');

      storageService.removeItem('key');
      expect(storageService.getItem('key')).toBeNull();
    });

    it('should handle multiple keys independently', () => {
      storageService.setItem('key1', 'value1');
      storageService.setItem('key2', 'value2');

      expect(storageService.getItem('key1')).toBe('value1');
      expect(storageService.getItem('key2')).toBe('value2');

      storageService.removeItem('key1');
      expect(storageService.getItem('key1')).toBeNull();
      expect(storageService.getItem('key2')).toBe('value2');
    });

    it('should store and retrieve timer settings JSON', () => {
      const settings = {
        workDuration: 30,
        shortBreakDuration: 10,
        longBreakDuration: 20,
        shortBreaksBeforeLong: 3
      };
      storageService.setItem('urdTimerSettings', JSON.stringify(settings));

      const retrieved = JSON.parse(storageService.getItem('urdTimerSettings')!);
      expect(retrieved).toEqual(settings);
    });
  });
});
