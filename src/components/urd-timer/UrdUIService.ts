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
    this.setupProgressRing();
    this.addKeyboardListener();
    this.update(this.INITIAL_TIME_LEFT, false);
  }

  update(timeLeft: number, isRunning: boolean): void {
    this.updateDisplay(timeLeft);
    this.updateStartStopButton(isRunning);
    this.updateSessionInfo();
    this.updateProgressRing(timeLeft);
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
    const progressCircle = this.shadowRoot.querySelector('.progress-ring__circle');
    
    if (sessionInfo) {
      const sessionType = this.timerService.getCurrentSession();
      const sessionCount = this.timerService.getCompletedSessions();
      
      let sessionLabel = '';
      let colorClass = '';
      
      switch (sessionType) {
        case 'work':
          sessionLabel = 'Arbete';
          colorClass = 'work';
          break;
        case 'shortBreak':
          sessionLabel = 'Kort paus';
          colorClass = 'short-break';
          break;
        case 'longBreak':
          sessionLabel = 'Lång paus';
          colorClass = 'long-break';
          break;
      }
      
      sessionInfo.textContent = `${sessionLabel} · Pomodoros: ${sessionCount}`;
      
      // Update progress ring color based on session type
      if (progressCircle) {
        progressCircle.classList.remove('work', 'short-break', 'long-break');
        progressCircle.classList.add(colorClass);
      }
    }
  }

  private setupProgressRing(): void {
    const circle = this.shadowRoot.querySelector('.progress-ring__circle') as SVGCircleElement;
    if (!circle) return;

    const radius = 140;
    const circumference = 2 * Math.PI * radius;
    
    // Set stroke-dasharray using setAttribute (more reliable for SVG)
    circle.setAttribute('stroke-dasharray', `${circumference} ${circumference}`);
    circle.setAttribute('stroke-dashoffset', '0');
  }

  private updateProgressRing(timeLeft: number): void {
    const circle = this.shadowRoot.querySelector('.progress-ring__circle') as SVGCircleElement;
    if (!circle) return;

    const radius = 140;
    const circumference = 2 * Math.PI * radius;
    
    // Get total duration for current session (in seconds)
    const sessionType = this.timerService.getCurrentSession();
    let totalSeconds = 0;
    
    switch (sessionType) {
      case 'work':
        totalSeconds = this.timerService.getWorkDuration();
        break;
      case 'shortBreak':
        totalSeconds = this.timerService.getShortBreakDuration();
        break;
      case 'longBreak':
        totalSeconds = this.timerService.getLongBreakDuration();
        break;
    }
    
    // Calculate how much of the circle should be VISIBLE (not hidden)
    // When timeLeft = totalSeconds (full time), we want offset = 0 (full circle visible)
    // When timeLeft = 0 (no time), we want offset = circumference (circle hidden)
    const progress = timeLeft / totalSeconds;
    const offset = circumference * (1 - progress);
    
    // Use setAttribute for SVG properties (more reliable than style)
    circle.setAttribute('stroke-dashoffset', offset.toString());
  }
}
