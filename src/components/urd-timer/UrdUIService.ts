import { UrdTimerObserver } from './UrdTimerObserver';
import { UrdTimerService } from './UrdTimerService';
import { IUrdUIRenderer } from './IUrdUIRenderer';
import { UrdUIDOMHandler } from './UrdUIDOMHandler';
import { UrdTimerDisplayService } from './UrdTimerDisplayService';
import { UrdProgressRingService } from './UrdProgressRingService';
import { UrdKeyboardShortcutService } from './UrdKeyboardShortcutService';
import { SECONDS_PER_MINUTE } from './UrdConstants';

export class UrdUIService implements UrdTimerObserver {
  private readonly INITIAL_TIME_LEFT: number;
  private displayService: UrdTimerDisplayService;
  private progressRingService: UrdProgressRingService;
  private keyboardService: UrdKeyboardShortcutService;
  private shadowRoot: ShadowRoot;
  private previousSession: 'work' | 'shortBreak' | 'longBreak' = 'work';

  constructor(
    shadowRoot: ShadowRoot,
    private timerService: UrdTimerService,
    private uiRenderer: IUrdUIRenderer,
    private domHandler: UrdUIDOMHandler
  ) {
    this.shadowRoot = shadowRoot;
    this.INITIAL_TIME_LEFT = this.timerService.getWorkDuration() * SECONDS_PER_MINUTE;
    this.displayService = new UrdTimerDisplayService(shadowRoot);
    this.progressRingService = new UrdProgressRingService(shadowRoot);
    this.keyboardService = new UrdKeyboardShortcutService(timerService);
  }

  async initialize(): Promise<void> {
    await this.uiRenderer.render();
    this.domHandler.initializeDOMElements();
    this.progressRingService.setupProgressRing();
    this.keyboardService.addKeyboardListener();
    this.update(this.INITIAL_TIME_LEFT, false);
  }

  update(timeLeft: number, isRunning: boolean): void {
    this.displayService.updateDisplay(timeLeft);
    this.displayService.updateStartStopButton(isRunning);
    this.updateSessionInfo();
    this.updateProgressRing(timeLeft);
  }

  removeKeyboardListener(): void {
    this.keyboardService.removeKeyboardListener();
  }

  addButtonListeners(toggleCallback: () => void, resetCallback: () => void): void {
    this.domHandler.addButtonListeners(toggleCallback, resetCallback);
  }

  private updateSessionInfo(): void {
    const sessionType = this.timerService.getCurrentSession();
    const sessionCount = this.timerService.getCompletedSessions();
    
    this.displayService.updateSessionInfo(sessionType, sessionCount);
    this.progressRingService.updateProgressRingColor(sessionType);
    
    // Handle overlay position animation on session change
    this.handleOverlayPositionChange(sessionType);
  }
  
  private handleOverlayPositionChange(sessionType: 'work' | 'shortBreak' | 'longBreak'): void {
    const container = this.shadowRoot.querySelector('#timer-container');
    
    if (!container || !container.classList.contains('overlay-mode')) {
      return; // Not in overlay mode
    }
    
    // Check if session type changed
    if (sessionType !== this.previousSession) {
      const currentPosition = container.getAttribute('data-position');
      let targetPosition: string;
      
      // Work session -> corner, Break session -> center
      if (sessionType === 'work') {
        targetPosition = currentPosition || 'top-right';
      } else {
        targetPosition = 'center';
      }
      
      // Apply fade out, change position, fade in
      container.classList.add('fading');
      
      setTimeout(() => {
        container.setAttribute('data-position', targetPosition);
        container.classList.remove('fading');
      }, 1000);
      
      this.previousSession = sessionType;
    }
  }

  private updateProgressRing(timeLeft: number): void {
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
    
    this.progressRingService.updateProgressRing(timeLeft, totalSeconds);
  }
}
