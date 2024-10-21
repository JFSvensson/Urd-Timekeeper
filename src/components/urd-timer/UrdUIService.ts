import { UrdTimerObserver } from './UrdTimerObserver';
import { UrdTimerService } from './UrdTimerService';
import { ResourceLoader } from '../../services/ResourceLoader';
import { SessionType } from './UrdSessionType';
import { SECONDS_PER_MINUTE, DEFAULT_WORK_DURATION, DEFAULT_SHORT_BREAK_DURATION, DEFAULT_LONG_BREAK_DURATION, DEFAULT_SHORT_BREAKS_BEFORE_LONG } from './UrdConstants';
import styles from './UrdTimer.css?inline';

export class UrdUIService implements UrdTimerObserver {
  private readonly INITIAL_TIME_LEFT: number = DEFAULT_WORK_DURATION * SECONDS_PER_MINUTE;
  private currentTimeLeft: number = this.INITIAL_TIME_LEFT;


  private inputElements = {
    workDuration: null as HTMLInputElement | null,
    shortBreakDuration: null as HTMLInputElement | null,
    longBreakDuration: null as HTMLInputElement | null,
    shortBreaksBeforeLong: null as HTMLInputElement | null
  };
  private saveSettingsButton: HTMLButtonElement | null = null;

  constructor(
    private shadowRoot: ShadowRoot | null, 
    private timerService: UrdTimerService, 
    private resourceLoader: ResourceLoader,
    baseUrl: string = import.meta.url
  ) {
    this.resourceLoader.setBaseUrl(baseUrl);
  }

  private initializeDOMElements() {
    this.inputElements.workDuration = this.shadowRoot?.querySelector('#work-duration') as HTMLInputElement;
    this.inputElements.shortBreakDuration = this.shadowRoot?.querySelector('#short-break-duration') as HTMLInputElement;
    this.inputElements.longBreakDuration = this.shadowRoot?.querySelector('#long-break-duration') as HTMLInputElement;
    this.inputElements.shortBreaksBeforeLong = this.shadowRoot?.querySelector('#short-breaks-before-long') as HTMLInputElement;
    this.saveSettingsButton = this.shadowRoot?.querySelector('#save-settings') as HTMLButtonElement;
  }

  private async renderContent(html: string) {
    if (this.shadowRoot) {
      const sheet = new CSSStyleSheet();
      await sheet.replace(styles);
      this.shadowRoot.adoptedStyleSheets = [sheet];
      this.shadowRoot.innerHTML = html;
    }
    this.initializeDOMElements();
    this.addSettingsEventListeners();
  }

  async render() {
    try {
      const html = await this.resourceLoader.fetchResource('./UrdTimer.html');
      await this.renderContent(html);
      this.update(this.INITIAL_TIME_LEFT, false);
      this.initializeDOMElements();
      this.addSettingsEventListeners();
      this.addKeyboardListener();
      this.renderKeyboardShortcutInfo();
    } catch (error) {
      console.error('Error rendering UrdUIService:', error);
    }
  }

  private renderKeyboardShortcutInfo() {
    const shortcutInfo = document.createElement('div');
    shortcutInfo.className = 'keyboard-shortcut';
    shortcutInfo.textContent = 'Press space to start/pause';
    this.shadowRoot?.appendChild(shortcutInfo);
  }

  private getUpdatedSettings(): { [key: string]: number } {
    return {
      workDuration: this.validateInput(this.inputElements.workDuration, DEFAULT_WORK_DURATION),
      shortBreakDuration: this.validateInput(this.inputElements.shortBreakDuration, DEFAULT_SHORT_BREAK_DURATION),
      longBreakDuration: this.validateInput(this.inputElements.longBreakDuration, DEFAULT_LONG_BREAK_DURATION),
      shortBreaksBeforeLong: this.validateInput(this.inputElements.shortBreaksBeforeLong, DEFAULT_SHORT_BREAKS_BEFORE_LONG)
    };
  }

  private addSettingsEventListeners() {
    this.saveSettingsButton?.addEventListener('click', () => {
      const settings = this.getUpdatedSettings();
      this.updateSettings(
        settings.workDuration,
        settings.shortBreakDuration,
        settings.longBreakDuration,
        settings.shortBreaksBeforeLong
      );
    });
  }

  private updateSettings(workDuration: number, shortBreakDuration: number, longBreakDuration: number, shortBreaksBeforeLong: number) {
    this.timerService.updateSettings(workDuration, shortBreakDuration, longBreakDuration, shortBreaksBeforeLong);
  }

  private validateInput(input: HTMLInputElement | null, defaultValue: number): number {
    if (!input) return defaultValue;
    const value = parseInt(input.value, 10);
    const min = parseInt(input.min, 10);
    const max = parseInt(input.max, 10);
    return isNaN(value) ? defaultValue : Math.max(min, Math.min(max, value));
  }

  addButtonListeners(toggleCallback: () => void, resetCallback: () => void) {
    const startStopButton = this.shadowRoot?.querySelector('#start-stop');
    const resetButton = this.shadowRoot?.querySelector('#reset');

    if (startStopButton && resetButton) {
      startStopButton.addEventListener('click', toggleCallback);
      resetButton.addEventListener('click', resetCallback);
    } else {
      console.error('Buttons not found in the shadow DOM');
    }
  }

  update(timeLeft: number, isRunning: boolean) {
    this.currentTimeLeft = timeLeft;
    this.updateDisplay(timeLeft);
    this.updateStartStopButton(isRunning);
    this.updateSessionInfo();
  }

  private updateDisplay(timeLeft: number) {
    const timeDisplay = this.shadowRoot?.querySelector('#time-display');
    if (timeDisplay) {
      timeDisplay.textContent = this.formatTime(timeLeft);
    }
  }

  private updateSessionInfo() {
    const sessionInfo = this.shadowRoot?.querySelector('#session-info');
    if (sessionInfo) {
      const currentSession = this.timerService.getCurrentSession();
      let sessionText = '';
      switch (currentSession) {
        case SessionType.Work:
          sessionText = 'Work Session';
          break;
        case SessionType.ShortBreak:
          sessionText = 'Short Break';
          break;
        case SessionType.LongBreak:
          sessionText = 'Long Break';
          break;
      }
      sessionInfo.textContent = sessionText;
    }
  }

  private updateStartStopButton(isRunning: boolean) {
    const startStopButton = this.shadowRoot?.querySelector('#start-stop');
    if (startStopButton) {
      if (isRunning) {
        startStopButton.textContent = 'Pause';
      } else {
        startStopButton.textContent = this.currentTimeLeft === this.timerService.getWorkDuration() ? 'Start' : 'Resume';
      }
    }
  }

  private formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / SECONDS_PER_MINUTE);
    const remainingSeconds = seconds % SECONDS_PER_MINUTE;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  private handleKeyPress = (event: KeyboardEvent) => {
    if (event.code === 'Space' || event.key === ' ') {
      event.preventDefault();
      this.timerService.toggle();
    }
  }

  addKeyboardListener() {
    document.addEventListener('keydown', this.handleKeyPress);
  }

  removeKeyboardListener() {
    document.removeEventListener('keydown', this.handleKeyPress);
  }
}
