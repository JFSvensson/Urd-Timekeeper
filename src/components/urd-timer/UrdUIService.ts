import { UrdTimerObserver } from './UrdTimerObserver';
import { UrdTimerService } from './UrdTimerService';
import { IUrdUIRenderer } from './IUrdUIRenderer';
import { UrdUIDOMHandler } from './UrdUIDOMHandler';
import { SECONDS_PER_MINUTE } from './UrdConstants';

export class UrdUIService implements UrdTimerObserver {
  private readonly INITIAL_TIME_LEFT: number;

  constructor(
    private shadowRoot: ShadowRoot,
    private timerService: UrdTimerService,
    private uiRenderer: IUrdUIRenderer,
    private domHandler: UrdUIDOMHandler
  ) {
    this.INITIAL_TIME_LEFT = this.timerService.getWorkDuration() * SECONDS_PER_MINUTE;
  }

  async initialize(): Promise<void> {
    await this.uiRenderer.render();
    this.domHandler.initializeDOMElements();
    this.addKeyboardListener();
    this.update(this.INITIAL_TIME_LEFT, false);
  }

  update(timeLeft: number, isRunning: boolean): void {
    this.updateDisplay(timeLeft);
    this.updateStartStopButton(isRunning);
    this.updateSessionInfo();
  }

  // Implementera andra nödvändiga metoder här, som updateDisplay, updateStartStopButton, etc.

  private handleKeyPress = (event: KeyboardEvent) => {
    if (event.code === 'Space' || event.key === ' ') {
      event.preventDefault();
      this.timerService.toggle();
    }
  }

  addKeyboardListener(): void {
    document.addEventListener('keydown', this.handleKeyPress);
  }

  removeKeyboardListener(): void {
    document.removeEventListener('keydown', this.handleKeyPress);
  }

  addButtonListeners(toggleCallback: () => void, resetCallback: () => void): void {
    this.domHandler.addButtonListeners(toggleCallback, resetCallback);
  }

  private updateDisplay(timeLeft: number): void {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeDisplay = this.shadowRoot.querySelector('#time-display');
    if (timeDisplay) {
      timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }

  private updateStartStopButton(isRunning: boolean): void {
    const button = this.shadowRoot.querySelector('#start-stop');
    if (button) {
      button.textContent = isRunning ? 'Pause' : 'Start';
    }
  }

  private updateSessionInfo(): void {
    const sessionInfo = this.shadowRoot.querySelector('#session-info');
    if (sessionInfo) {
      const sessionType = this.timerService.getCurrentSession();
      const sessionCount = this.timerService.getCompletedSessions();
      sessionInfo.textContent = `${sessionType} - Pomodoros: ${sessionCount}`;
    }
  }
}
