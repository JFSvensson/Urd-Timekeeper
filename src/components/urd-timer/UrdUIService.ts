import { UrdTimerObserver } from './UrdTimerObserver';
import { UrdTimerService } from './UrdTimerService';

export class UrdUIService implements UrdTimerObserver {
  private currentTimeLeft: number = 25 * 60;
  private workDurationInput: HTMLInputElement | null = null;
  private shortBreakDurationInput: HTMLInputElement | null = null;
  private longBreakDurationInput: HTMLInputElement | null = null;
  private saveSettingsButton: HTMLButtonElement | null = null;
  private timerService: UrdTimerService;

  constructor(private shadowRoot: ShadowRoot | null, timerService: UrdTimerService) {
    this.timerService = timerService;
  }

  async render() {
    try {
      const [style, html] = await Promise.all([
        this.fetchResource('./UrdTimer.css'),
        this.fetchResource('./UrdTimer.html')
      ]);

      if (this.shadowRoot) {
        this.shadowRoot.innerHTML = `<style>${style}</style>${html}`;
      }

      this.workDurationInput = this.shadowRoot?.querySelector('#work-duration') as HTMLInputElement;
      this.shortBreakDurationInput = this.shadowRoot?.querySelector('#short-break-duration') as HTMLInputElement;
      this.longBreakDurationInput = this.shadowRoot?.querySelector('#long-break-duration') as HTMLInputElement;
      this.saveSettingsButton = this.shadowRoot?.querySelector('#save-settings') as HTMLButtonElement;

      this.addSettingsEventListeners();
    } catch (error) {
      console.error('Error in render:', error);
    }
    this.update(25 * 60, false);
  }

  private addSettingsEventListeners() {
    this.saveSettingsButton?.addEventListener('click', () => {
      const workDuration = this.validateInput(this.workDurationInput, 25);
      const shortBreakDuration = this.validateInput(this.shortBreakDurationInput, 5);
      const longBreakDuration = this.validateInput(this.longBreakDurationInput, 15);

      this.updateSettings(workDuration, shortBreakDuration, longBreakDuration);
    });
  }

  private updateSettings(workDuration: number, shortBreakDuration: number, longBreakDuration: number) {
    this.timerService.updateSettings(workDuration, shortBreakDuration, longBreakDuration);
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
  }

  updateDisplay(timeLeft: number) {
    const timeDisplay = this.shadowRoot?.querySelector('#time-display');
    if (timeDisplay) {
      timeDisplay.textContent = this.formatTime(timeLeft);
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
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  private async fetchResource(url: string): Promise<string> {
    const response = await fetch(new URL(url, import.meta.url));
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    return response.text();
  }
}
