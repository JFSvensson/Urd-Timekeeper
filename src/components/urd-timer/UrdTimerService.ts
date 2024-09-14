import { UrdTimerObserver } from './UrdTimerObserver';

export class UrdTimerService {
  private timer: number | null = null;
  private timeLeft: number = 25 * 60;
  private isWorking: boolean = true;
  private observers: UrdTimerObserver[] = [];

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
      observer.update(this.timeLeft, this.isWorking);
    }
  }

  toggle() {
    this.timer ? this.pause() : this.start();
  }

  reset() {
    this.pause();
    this.timeLeft = 25 * 60;
    this.isWorking = true;
    this.notifyObservers();
  }

  private start() {
    this.timer = window.setInterval(() => {
      this.timeLeft--;
      this.notifyObservers();
      if (this.timeLeft <= 0) {
        this.switchMode();
      }
    }, 1000);
  }

  private pause() {
    if (this.timer) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
    this.notifyObservers();
  }

  private switchMode() {
    this.isWorking = !this.isWorking;
    this.timeLeft = this.isWorking ? 25 * 60 : 5 * 60;
    this.notifyObservers();
    this.notifyUser();
  }

  private notifyUser() {
    if (Notification.permission === 'granted') {
      new Notification(this.isWorking ? 'Dags att arbeta!' : 'Dags för en paus!');
    }
  }
}
