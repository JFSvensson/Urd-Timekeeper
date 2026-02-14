import { UrdTimerObserver } from './UrdTimerObserver';
import { UrdTimerService } from './UrdTimerService';
import { IUrdUIRenderer } from './IUrdUIRenderer';
import { UrdUIDOMHandler } from './UrdUIDOMHandler';
import { UrdTimerDisplayService } from './UrdTimerDisplayService';
import { UrdProgressRingService } from './UrdProgressRingService';
import { UrdKeyboardShortcutService } from './UrdKeyboardShortcutService';

export class UrdUIService implements UrdTimerObserver {
  private readonly INITIAL_TIME_LEFT: number;
  private displayService: UrdTimerDisplayService;
  private progressRingService: UrdProgressRingService;
  private keyboardService: UrdKeyboardShortcutService;

  constructor(
    shadowRoot: ShadowRoot,
    private timerService: UrdTimerService,
    private uiRenderer: IUrdUIRenderer,
    private domHandler: UrdUIDOMHandler
  ) {
    this.INITIAL_TIME_LEFT = this.timerService.getWorkDuration();
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

  addSettingsEventListeners(): void {
    this.domHandler.addSettingsEventListeners();
  }

  private updateSessionInfo(): void {
    const sessionType = this.timerService.getCurrentSession();
    const sessionCount = this.timerService.getCompletedSessions();
    
    this.displayService.updateSessionInfo(sessionType, sessionCount);
    this.progressRingService.updateProgressRingColor(sessionType);
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
