import { StorageService } from './StorageService';

export interface SessionRecord {
  type: 'work' | 'shortBreak' | 'longBreak';
  durationMinutes: number;
  completedAt: string;
}

export interface SessionStats {
  today: number;
  thisWeek: number;
  allTime: number;
}

export class SessionHistoryService {
  private static readonly STORAGE_KEY = 'urdSessionHistory';

  constructor(private storageService: StorageService) {}

  recordSession(type: 'work' | 'shortBreak' | 'longBreak', durationMinutes: number): void {
    const history = this.loadHistory();
    history.push({
      type,
      durationMinutes,
      completedAt: new Date().toISOString(),
    });
    this.saveHistory(history);
  }

  getWorkStats(): SessionStats {
    const history = this.loadHistory().filter((s) => s.type === 'work');
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = startOfDay - now.getDay() * 86400000;

    return {
      today: history.filter((s) => new Date(s.completedAt).getTime() >= startOfDay).length,
      thisWeek: history.filter((s) => new Date(s.completedAt).getTime() >= startOfWeek).length,
      allTime: history.length,
    };
  }

  getTotalWorkMinutesToday(): number {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    return this.loadHistory()
      .filter((s) => s.type === 'work' && new Date(s.completedAt).getTime() >= startOfDay)
      .reduce((sum, s) => sum + s.durationMinutes, 0);
  }

  private loadHistory(): SessionRecord[] {
    try {
      const data = this.storageService.getItem(SessionHistoryService.STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Corrupted data — start fresh
    }
    return [];
  }

  private saveHistory(history: SessionRecord[]): void {
    this.storageService.setItem(SessionHistoryService.STORAGE_KEY, JSON.stringify(history));
  }
}
