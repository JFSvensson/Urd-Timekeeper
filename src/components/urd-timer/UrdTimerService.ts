import { UrdTimerObserver } from './UrdTimerObserver';
import { SessionType } from './UrdSessionType';
import { MessageService } from '../../services/MessageService';
import { UrdSettingsManager } from './UrdSettingsManager';
import { SECONDS_PER_MINUTE } from './UrdConstants';

export class UrdTimerService {
  private timer: number | null = null;
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
  
  constructor(
    private settingsManager: UrdSettingsManager,
    private messageService: MessageService,
    overlayMode: boolean = false
  ) {
    this.overlayMode = overlayMode;
    const settings = this.settingsManager.loadSettings();
    const settingsInSeconds = this.settingsManager.getSettingsInSeconds(settings);
    this.workDuration = settingsInSeconds.workDuration;
    this.shortBreakDuration = settingsInSeconds.shortBreakDuration;
    this.longBreakDuration = settingsInSeconds.longBreakDuration;
    this.shortBreaksBeforeLong = settingsInSeconds.shortBreaksBeforeLong;
    this.timeLeft = this.workDuration;
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

  updateSettings(workDuration: number, shortBreakDuration: number, longBreakDuration: number, shortBreaksBeforeLong: number) {
    const settings = {
      workDuration,
      shortBreakDuration,
      longBreakDuration,
      shortBreaksBeforeLong
    };
    
    this.settingsManager.saveSettings(settings);
    const settingsInSeconds = this.settingsManager.getSettingsInSeconds(settings);
    
    this.workDuration = settingsInSeconds.workDuration;
    this.shortBreakDuration = settingsInSeconds.shortBreakDuration;
    this.longBreakDuration = settingsInSeconds.longBreakDuration;
    this.shortBreaksBeforeLong = settingsInSeconds.shortBreaksBeforeLong;
    
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
      this.timer = window.setInterval(() => {
        this.timeLeft--;
        if (this.timeLeft <= 0) {
          this.switchMode();
        }
        this.notifyObservers();
      }, 1000);
      this.isRunning = true;
    }
  }

  private pause() {
    if (this.timer) {
      window.clearInterval(this.timer);
      this.timer = null;
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
    this.completedSessions++;
    if (this.currentSession === SessionType.Work) {
      if (this.completedSessions % this.shortBreaksBeforeLong === 0) {
        this.currentSession = SessionType.LongBreak;
        this.timeLeft = this.longBreakDuration;
      } else {
        this.currentSession = SessionType.ShortBreak;
        this.timeLeft = this.shortBreakDuration;
      }
    } else {
      this.currentSession = SessionType.Work;
      this.timeLeft = this.workDuration;
    }
    this.notifyObservers();
    this.notifyUser();
    
    // Auto-start next session in overlay mode after 5 seconds
    if (this.overlayMode) {
      setTimeout(() => {
        this.start();
      }, 5000);
    }
  }

  private notifyUser() {
    const message = this.currentSession === SessionType.Work 
      ? 'Dags att arbeta!' 
      : 'Dags för en paus!';
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

  getConfig() {
    return {
      workDuration: this.workDuration / SECONDS_PER_MINUTE,
      shortBreakDuration: this.shortBreakDuration / SECONDS_PER_MINUTE,
      longBreakDuration: this.longBreakDuration / SECONDS_PER_MINUTE,
      shortBreaksBeforeLong: this.shortBreaksBeforeLong
    };
  }

  getState() {
    return {
      timeLeft: this.timeLeft,
      isRunning: this.isRunning,
      currentSession: this.currentSession,
      completedSessions: this.completedSessions
    };
  }
}
