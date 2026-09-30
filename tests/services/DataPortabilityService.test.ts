/// <reference types="jest" />
import { DataPortabilityService } from '../../src/services/DataPortabilityService';
import { SessionHistoryService } from '../../src/services/SessionHistoryService';
import { UrdSettingsManager } from '../../src/components/urd-timer/UrdSettingsManager';
import { MockStorageService } from '../mocks/serviceMocks';

describe('DataPortabilityService', () => {
  let storage: MockStorageService;
  let settingsManager: UrdSettingsManager;
  let historyService: SessionHistoryService;
  let portabilityService: DataPortabilityService;

  beforeEach(() => {
    storage = new MockStorageService();
    settingsManager = new UrdSettingsManager(storage);
    historyService = new SessionHistoryService(storage);
    portabilityService = new DataPortabilityService(settingsManager, historyService);
  });

  it('exports settings and session history as a versioned backup', () => {
    settingsManager.saveSettings({
      workDuration: 30,
      shortBreakDuration: 10,
      longBreakDuration: 20,
      shortBreaksBeforeLong: 3,
      soundEnabled: false,
      volume: 0.7,
    });
    historyService.recordSession('work', 30);

    const backup = portabilityService.exportBackup();

    expect(backup.version).toBe(1);
    expect(backup.settings.workDuration).toBe(30);
    expect(backup.settings.soundEnabled).toBe(false);
    expect(backup.sessions).toHaveLength(1);
  });

  it('imports a valid backup', () => {
    const imported = portabilityService.importBackup({
      version: 1,
      exportedAt: '2026-09-30T12:00:00.000Z',
      settings: {
        workDuration: 45,
        shortBreakDuration: 10,
        longBreakDuration: 20,
        shortBreaksBeforeLong: 3,
        soundEnabled: true,
        volume: 0.8,
      },
      sessions: [
        {
          type: 'work',
          durationMinutes: 45,
          completedAt: '2026-09-30T12:00:00.000Z',
        },
      ],
    });

    expect(imported).toBe(true);
    expect(settingsManager.loadSettings().workDuration).toBe(45);
    expect(historyService.getHistory()).toHaveLength(1);
  });

  it('rejects malformed backups without changing storage', () => {
    historyService.recordSession('work', 25);
    const before = portabilityService.exportBackup();

    const imported = portabilityService.importBackup({
      version: 1,
      exportedAt: 'not-a-date',
      settings: before.settings,
      sessions: before.sessions,
    });

    expect(imported).toBe(false);
    const after = portabilityService.exportBackup();
    expect(after.settings).toEqual(before.settings);
    expect(after.sessions).toEqual(before.sessions);
  });
});
