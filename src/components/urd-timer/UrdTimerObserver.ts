export interface UrdTimerObserver {
  update(timeLeft: number, isWorking: boolean): void;
}
