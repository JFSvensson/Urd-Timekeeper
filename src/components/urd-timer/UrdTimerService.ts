import { UrdTimerObserver } from './UrdTimerObserver';

export class UrdTimerService {
  private timer: number | null = null;
  private timeLeft: number = 25 * 60;
  private isRunning: boolean = false;
  private observers: UrdTimerObserver[] = [];
  private workDuration: number = 25 * 60;
  private shortBreakDuration: number = 5 * 60;
  private longBreakDuration: number = 15 * 60;
  private currentSession: 'work' | 'shortBreak' | 'longBreak' = 'work';
  private completedSessions: number = 0;

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
    this.workDuration = workDuration * 60;
    this.shortBreakDuration = shortBreakDuration * 60;
    this.longBreakDuration = longBreakDuration * 60;
    this.shortBreaksBeforeLong = shortBreaksBeforeLong;
    this.saveSettings();
    this.reset();
  }

  private saveSettings() {
    localStorage.setItem('urdTimerSettings', JSON.stringify({
      workDuration: this.workDuration / 60,
      shortBreakDuration: this.shortBreakDuration / 60,
      longBreakDuration: this.longBreakDuration / 60,
      shortBreaksBeforeLong: this.shortBreaksBeforeLong
    }));
  }

  loadSettings() {
    const savedSettings = localStorage.getItem('urdTimerSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      this.workDuration = settings.workDuration * 60;
      this.shortBreakDuration = settings.shortBreakDuration * 60;
      this.longBreakDuration = settings.longBreakDuration * 60;
      this.shortBreaksBeforeLong = settings.shortBreaksBeforeLong;
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

  private switchMode() {
    this.completedSessions++;
    if (this.currentSession === 'work') {
      if (this.completedSessions % this.shortBreaksBeforeLong === 0) {
        this.currentSession = 'longBreak';
        this.timeLeft = this.longBreakDuration;
      } else {
        this.currentSession = 'shortBreak';
        this.timeLeft = this.shortBreakDuration;
      }
    } else {
      this.currentSession = 'work';
      this.timeLeft = this.workDuration;
    }
    this.notifyObservers();
    this.notifyUser();
  }

  private notifyUser() {
    if (Notification.permission === 'granted') {
      new Notification(this.currentSession === 'work' ? 'Time to work!' : 'Time for a break!');
    }
  }

  getCurrentSession(): 'work' | 'shortBreak' | 'longBreak' {
    return this.currentSession;
  }
}
