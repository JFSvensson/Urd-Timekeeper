import { UrdTimerObserver } from './UrdTimerObserver';
import { SessionType } from './UrdSessionType';
import { MessageService } from '../../services/MessageService';
import { AudioService } from '../../services/AudioService';
import { SessionHistoryService } from '../../services/SessionHistoryService';
import { DataPortabilityService, TimerBackup } from '../../services/DataPortabilityService';
import { UrdSettingsManager } from './UrdSettingsManager';
import { advanceSession } from './UrdSessionStateMachine';
import { SECONDS_PER_MINUTE } from './UrdConstants';

export interface TimerClock {
  now(): number;
}

export interface TimerScheduler {
  setTimeout(callback: () => void, delay: number): number;
  clearTimeout(timer: number): void;
}

export class UrdTimerService {
  private timer: number | null = null;
  private overlayRestartTimeout: number | null = null;
  private sessionDeadline: number = 0;
  private timeLeft: number;
  private isRunning: boolean = false;
  private observers: UrdTimerObserver[] = [];
  private workDuration: number;
  private shortBreakDuration: number;
  private longBreakDuration: number;
  private shortBreaksBeforeLong: number;
  private currentSession: SessionType = SessionType.Work;
  private completedSessions: number = 0;
  private overlayMode: boolean = false;
  private dataPortabilityService: DataPortabilityService | null = null;

  constructor(
    private settingsManager: UrdSettingsManager,
    private messageService: MessageService,
    overlayMode: boolean = false,
    private audioService: AudioService | null = null,
    private sessionHistory: SessionHistoryService | null = null,
    private clock: TimerClock = { now: () => Date.now() },
    private scheduler: TimerScheduler = {
      setTimeout: (callback, delay) => window.setTimeout(callback, delay),
      clearTimeout: (timer) => window.clearTimeout(timer),
    }
  ) {
    this.overlayMode = overlayMode;
    const settings = this.settingsManager.loadSettings();
    const settingsInSeconds = this.settingsManager.getSettingsInSeconds(settings);
    this.workDuration = settingsInSeconds.workDuration;
    this.shortBreakDuration = settingsInSeconds.shortBreakDuration;
    this.longBreakDuration = settingsInSeconds.longBreakDuration;
    this.shortBreaksBeforeLong = settingsInSeconds.shortBreaksBeforeLong;
    this.timeLeft = this.workDuration;

    // Apply saved sound settings
    if (this.audioService) {
      this.audioService.setVolume(settings.volume);
      this.audioService.setMuted(!settings.soundEnabled);
    }

    if (this.sessionHistory) {
      this.dataPortabilityService = new DataPortabilityService(
        this.settingsManager,
        this.sessionHistory
      );
    }
  }

  addObserver(observer: UrdTimerObserver) {
    this.observers.push(observer);
  }

  removeObserver(observer: UrdTimerObserver) {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  private notifyObservers() {
    for (const observer of this.observers) {
      observer.update(this.timeLeft, this.isRunning);
    }
  }

  updateSettings(
    workDuration: number,
    shortBreakDuration: number,
    longBreakDuration: number,
    shortBreaksBeforeLong: number,
    soundEnabled?: boolean,
    volume?: number
  ) {
    const current = this.settingsManager.loadSettings();
    const settings = {
      workDuration,
      shortBreakDuration,
      longBreakDuration,
      shortBreaksBeforeLong,
      soundEnabled: soundEnabled ?? current.soundEnabled,
      volume: volume ?? current.volume,
    };

    this.settingsManager.saveSettings(settings);
    const settingsInSeconds = this.settingsManager.getSettingsInSeconds(settings);

    this.workDuration = settingsInSeconds.workDuration;
    this.shortBreakDuration = settingsInSeconds.shortBreakDuration;
    this.longBreakDuration = settingsInSeconds.longBreakDuration;
    this.shortBreaksBeforeLong = settingsInSeconds.shortBreaksBeforeLong;

    if (this.audioService) {
      this.audioService.setVolume(settings.volume);
      this.audioService.setMuted(!settings.soundEnabled);
    }

    this.reset();
  }

  loadSettings() {
    const settings = this.settingsManager.loadSettings();
    const settingsInSeconds = this.settingsManager.getSettingsInSeconds(settings);

    this.workDuration = settingsInSeconds.workDuration;
    this.shortBreakDuration = settingsInSeconds.shortBreakDuration;
    this.longBreakDuration = settingsInSeconds.longBreakDuration;
    this.shortBreaksBeforeLong = settingsInSeconds.shortBreaksBeforeLong;

    this.reset();
  }

  reset() {
    this.timeLeft = this.workDuration;
    this.pause();
    this.notifyObservers();
  }

  stop() {
    this.pause();
  }

  toggle() {
    if (this.isRunning) {
      this.pause();
    } else {
      this.start();
    }
    this.notifyObservers();
  }

  start() {
    if (!this.isRunning) {
      this.messageService.requestPermission?.();
      this.isRunning = true;
      this.sessionDeadline = this.clock.now() + this.timeLeft * 1000;
      this.scheduleTick();
    }
  }

  private scheduleTick(): void {
    const delay = Math.min(1000, Math.max(0, this.sessionDeadline - this.clock.now()));
    this.timer = this.scheduler.setTimeout(() => this.tick(), delay);
  }

  private tick(): void {
    if (!this.isRunning) return;

    if (this.clock.now() >= this.sessionDeadline) {
      this.switchMode();
    } else {
      this.timeLeft = Math.max(1, Math.ceil((this.sessionDeadline - this.clock.now()) / 1000));
      this.notifyObservers();
    }

    if (this.isRunning) {
      this.scheduleTick();
    }
  }

  private pause() {
    if (this.timer !== null) {
      this.scheduler.clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.overlayRestartTimeout !== null) {
      this.scheduler.clearTimeout(this.overlayRestartTimeout);
      this.overlayRestartTimeout = null;
    }
    this.isRunning = false;
  }

  getWorkDuration(): number {
    return this.workDuration;
  }

  getShortBreakDuration(): number {
    return this.shortBreakDuration;
  }

  getLongBreakDuration(): number {
    return this.longBreakDuration;
  }

  private switchMode() {
    // Record the completed session before switching
    this.recordCompletedSession();

    const nextState = advanceSession(
      {
        currentSession: this.currentSession,
        completedSessions: this.completedSessions,
      },
      this.shortBreaksBeforeLong
    );
    this.currentSession = nextState.currentSession;
    this.completedSessions = nextState.completedSessions;

    if (this.currentSession === SessionType.LongBreak) {
      this.timeLeft = this.longBreakDuration;
    } else if (this.currentSession === SessionType.ShortBreak) {
      this.timeLeft = this.shortBreakDuration;
    } else {
      this.timeLeft = this.workDuration;
    }
    this.sessionDeadline = this.clock.now() + this.timeLeft * 1000;
    this.notifyObservers();
    this.notifyUser();
    this.audioService?.playNotification(this.currentSession);

    // Auto-start next session in overlay mode after 5 seconds
    if (this.overlayMode) {
      this.isRunning = false;
      if (this.overlayRestartTimeout !== null) {
        this.scheduler.clearTimeout(this.overlayRestartTimeout);
      }
      this.overlayRestartTimeout = this.scheduler.setTimeout(() => {
        this.overlayRestartTimeout = null;
        this.start();
      }, 5000);
    }
  }

  private notifyUser() {
    const message =
      this.currentSession === SessionType.Work ? 'Dags att arbeta!' : 'Dags för en paus!';
    this.messageService.showMessage(message);
  }

  getCurrentSession(): 'work' | 'shortBreak' | 'longBreak' {
    return this.currentSession;
  }

  getCompletedSessions(): number {
    return this.completedSessions;
  }

  getTimeLeft(): number {
    return this.timeLeft;
  }

  getIsRunning(): boolean {
    return this.isRunning;
  }

  getAudioService(): AudioService | null {
    return this.audioService;
  }

  getSessionHistory(): SessionHistoryService | null {
    return this.sessionHistory;
  }

  private recordCompletedSession(): void {
    if (!this.sessionHistory) return;
    const typeMap: Record<SessionType, 'work' | 'shortBreak' | 'longBreak'> = {
      [SessionType.Work]: 'work',
      [SessionType.ShortBreak]: 'shortBreak',
      [SessionType.LongBreak]: 'longBreak',
    };
    const durationMap: Record<SessionType, number> = {
      [SessionType.Work]: this.workDuration / SECONDS_PER_MINUTE,
      [SessionType.ShortBreak]: this.shortBreakDuration / SECONDS_PER_MINUTE,
      [SessionType.LongBreak]: this.longBreakDuration / SECONDS_PER_MINUTE,
    };
    this.sessionHistory.recordSession(
      typeMap[this.currentSession],
      durationMap[this.currentSession]
    );
  }

  getConfig() {
    return {
      workDuration: this.workDuration / SECONDS_PER_MINUTE,
      shortBreakDuration: this.shortBreakDuration / SECONDS_PER_MINUTE,
      longBreakDuration: this.longBreakDuration / SECONDS_PER_MINUTE,
      shortBreaksBeforeLong: this.shortBreaksBeforeLong,
    };
  }

  getSettings() {
    return this.settingsManager.loadSettings();
  }

  exportBackup(): TimerBackup | null {
    return this.dataPortabilityService?.exportBackup() ?? null;
  }

  importBackup(data: unknown): boolean {
    if (!this.dataPortabilityService?.importBackup(data)) return false;
    this.loadSettings();
    return true;
  }

  getState() {
    return {
      timeLeft: this.timeLeft,
      isRunning: this.isRunning,
      currentSession: this.currentSession,
      completedSessions: this.completedSessions,
    };
  }
}
