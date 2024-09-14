export interface UrdTimerObserver {
  update(timeLeft: number, isRunning: boolean): void;
}
