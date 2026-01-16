import { UrdTimerObserver } from './UrdTimerObserver';
import { SessionType } from './UrdSessionType';
import { StorageService } from '../../services/StorageService';
import { MessageService } from '../../services/MessageService';
import { SECONDS_PER_MINUTE, DEFAULT_WORK_DURATION, DEFAULT_SHORT_BREAK_DURATION, DEFAULT_LONG_BREAK_DURATION, DEFAULT_SHORT_BREAKS_BEFORE_LONG } from './UrdConstants';

export class UrdTimerService {
  private timer: number | null = null;
  private timeLeft: number = DEFAULT_WORK_DURATION * SECONDS_PER_MINUTE;
  private isRunning: boolean = false;
  private observers: UrdTimerObserver[] = [];
  private workDuration: number = DEFAULT_WORK_DURATION * SECONDS_PER_MINUTE;
  private shortBreakDuration: number = DEFAULT_SHORT_BREAK_DURATION * SECONDS_PER_MINUTE;
  private longBreakDuration: number = DEFAULT_LONG_BREAK_DURATION * SECONDS_PER_MINUTE;
  private shortBreaksBeforeLong: number = DEFAULT_SHORT_BREAKS_BEFORE_LONG;
  private currentSession: SessionType = SessionType.Work;
  private completedSessions: number = 0;
  
  constructor(private storageService: StorageService, private messageService: MessageService) {}

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
    this.workDuration = workDuration * SECONDS_PER_MINUTE;
    this.shortBreakDuration = shortBreakDuration * SECONDS_PER_MINUTE;
    this.longBreakDuration = longBreakDuration * SECONDS_PER_MINUTE;
    this.shortBreaksBeforeLong = shortBreaksBeforeLong;
    this.saveSettings();
    this.reset();
  }

  private saveSettings() {
    try {
      this.storageService.setItem('urdTimerSettings', JSON.stringify({
        workDuration: this.workDuration / SECONDS_PER_MINUTE,
        shortBreakDuration: this.shortBreakDuration / SECONDS_PER_MINUTE,
        longBreakDuration: this.longBreakDuration / SECONDS_PER_MINUTE,
        shortBreaksBeforeLong: this.shortBreaksBeforeLong
      }));
    } catch (error) {
      console.error('Failed to save timer settings:', error);
    }
  }

  loadSettings() {
    try {
      const savedSettings = this.storageService.getItem('urdTimerSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        this.workDuration = settings.workDuration * SECONDS_PER_MINUTE;
        this.shortBreakDuration = settings.shortBreakDuration * SECONDS_PER_MINUTE;
        this.longBreakDuration = settings.longBreakDuration * SECONDS_PER_MINUTE;
        this.shortBreaksBeforeLong = settings.shortBreaksBeforeLong;
      }
    } catch (error) {
      console.error('Failed to load timer settings, using defaults:', error);
    }
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

  private start() {
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
