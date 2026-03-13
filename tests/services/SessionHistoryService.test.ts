import { SessionHistoryService } from '../../src/services/SessionHistoryService';
import { MockStorageService } from '../mocks/serviceMocks';

describe('SessionHistoryService', () => {
  let storageService: MockStorageService;
  let historyService: SessionHistoryService;

  beforeEach(() => {
    storageService = new MockStorageService();
    historyService = new SessionHistoryService(storageService);
  });

  describe('recordSession', () => {
    it('should store a work session', () => {
      historyService.recordSession('work', 25);

      const stored = JSON.parse(storageService.getItem('urdSessionHistory') as string);
      expect(stored).toHaveLength(1);
      expect(stored[0].type).toBe('work');
      expect(stored[0].durationMinutes).toBe(25);
      expect(stored[0].completedAt).toBeDefined();
    });

    it('should store a break session', () => {
      historyService.recordSession('shortBreak', 5);

      const stored = JSON.parse(storageService.getItem('urdSessionHistory') as string);
      expect(stored[0].type).toBe('shortBreak');
      expect(stored[0].durationMinutes).toBe(5);
    });

    it('should append to existing history', () => {
      historyService.recordSession('work', 25);
      historyService.recordSession('shortBreak', 5);
      historyService.recordSession('work', 25);

      const stored = JSON.parse(storageService.getItem('urdSessionHistory') as string);
      expect(stored).toHaveLength(3);
    });
  });

  describe('getWorkStats', () => {
    it('should return zeros when no sessions recorded', () => {
      const stats = historyService.getWorkStats();
      expect(stats).toEqual({ today: 0, thisWeek: 0, allTime: 0 });
    });

    it('should count only work sessions', () => {
      historyService.recordSession('work', 25);
      historyService.recordSession('shortBreak', 5);
      historyService.recordSession('work', 25);

      const stats = historyService.getWorkStats();
      expect(stats.allTime).toBe(2);
    });

    it('should count today sessions correctly', () => {
      historyService.recordSession('work', 25);
      historyService.recordSession('work', 25);

      const stats = historyService.getWorkStats();
      expect(stats.today).toBe(2);
      expect(stats.thisWeek).toBeGreaterThanOrEqual(2);
      expect(stats.allTime).toBe(2);
    });

    it('should not count old sessions as today', () => {
      // Manually insert an old session
      const oldSession = {
        type: 'work',
        durationMinutes: 25,
        completedAt: new Date('2020-01-01').toISOString(),
      };
      storageService.setItem('urdSessionHistory', JSON.stringify([oldSession]));

      const stats = historyService.getWorkStats();
      expect(stats.today).toBe(0);
      expect(stats.allTime).toBe(1);
    });
  });

  describe('getTotalWorkMinutesToday', () => {
    it('should return 0 when no sessions', () => {
      expect(historyService.getTotalWorkMinutesToday()).toBe(0);
    });

    it('should sum work minutes for today', () => {
      historyService.recordSession('work', 25);
      historyService.recordSession('work', 25);
      historyService.recordSession('shortBreak', 5);

      expect(historyService.getTotalWorkMinutesToday()).toBe(50);
    });

    it('should not include old sessions', () => {
      const oldSession = {
        type: 'work',
        durationMinutes: 25,
        completedAt: new Date('2020-01-01').toISOString(),
      };
      storageService.setItem('urdSessionHistory', JSON.stringify([oldSession]));

      expect(historyService.getTotalWorkMinutesToday()).toBe(0);
    });
  });

  describe('error handling', () => {
    it('should handle corrupted storage data', () => {
      storageService.setItem('urdSessionHistory', '{invalid json}');

      const stats = historyService.getWorkStats();
      expect(stats).toEqual({ today: 0, thisWeek: 0, allTime: 0 });
    });

    it('should recover from corrupted data by recording new sessions', () => {
      storageService.setItem('urdSessionHistory', 'not-json');
      historyService.recordSession('work', 25);

      const stats = historyService.getWorkStats();
      expect(stats.allTime).toBe(1);
    });
  });
});
