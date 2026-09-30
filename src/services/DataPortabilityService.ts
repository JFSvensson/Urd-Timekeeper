import { TimerSettings, UrdSettingsManager } from '../components/urd-timer/UrdSettingsManager';
import { SessionHistoryService, SessionRecord } from './SessionHistoryService';

export interface TimerBackup {
  version: 1;
  exportedAt: string;
  settings: TimerSettings;
  sessions: SessionRecord[];
}

export class DataPortabilityService {
  constructor(
    private settingsManager: UrdSettingsManager,
    private historyService: SessionHistoryService
  ) {}

  exportBackup(): TimerBackup {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      settings: this.settingsManager.loadSettings(),
      sessions: this.historyService.getHistory(),
    };
  }

  importBackup(data: unknown): boolean {
    if (!this.isBackup(data)) return false;

    this.settingsManager.saveSettings(data.settings);
    return this.historyService.replaceHistory(data.sessions);
  }

  private isBackup(data: unknown): data is TimerBackup {
    if (!data || typeof data !== 'object') return false;

    const backup = data as Partial<TimerBackup>;
    return (
      backup.version === 1 &&
      typeof backup.exportedAt === 'string' &&
      !Number.isNaN(Date.parse(backup.exportedAt)) &&
      this.settingsManager.isValidSettings(backup.settings) &&
      Array.isArray(backup.sessions) &&
      backup.sessions.every((session) => this.isSessionRecord(session))
    );
  }

  private isSessionRecord(session: unknown): session is SessionRecord {
    if (!session || typeof session !== 'object') return false;

    const record = session as Partial<SessionRecord>;
    return (
      (record.type === 'work' || record.type === 'shortBreak' || record.type === 'longBreak') &&
      typeof record.durationMinutes === 'number' &&
      Number.isFinite(record.durationMinutes) &&
      record.durationMinutes > 0 &&
      typeof record.completedAt === 'string' &&
      !Number.isNaN(Date.parse(record.completedAt))
    );
  }
}
