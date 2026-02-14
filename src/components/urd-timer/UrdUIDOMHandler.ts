import { UrdTimerService } from './UrdTimerService';

export class UrdUIDOMHandler {
  private inputElements = {
    workDuration: null as HTMLInputElement | null,
    shortBreakDuration: null as HTMLInputElement | null,
    longBreakDuration: null as HTMLInputElement | null,
    shortBreaksBeforeLong: null as HTMLInputElement | null,
  };
  private saveSettingsButton: HTMLButtonElement | null = null;

  constructor(
    private shadowRoot: ShadowRoot,
    private timerService: UrdTimerService
  ) {}

  initializeDOMElements(): void {
    this.inputElements.workDuration = this.shadowRoot.querySelector('#work-duration');
    this.inputElements.shortBreakDuration = this.shadowRoot.querySelector('#short-break-duration');
    this.inputElements.longBreakDuration = this.shadowRoot.querySelector('#long-break-duration');
    this.inputElements.shortBreaksBeforeLong = this.shadowRoot.querySelector(
      '#short-breaks-before-long'
    );
    this.saveSettingsButton = this.shadowRoot.querySelector('#save-settings');
  }

  addSettingsEventListeners(): void {
    this.saveSettingsButton?.addEventListener('click', () => {
      const settings = this.getUpdatedSettings();
      this.timerService.updateSettings(
        settings.workDuration,
        settings.shortBreakDuration,
        settings.longBreakDuration,
        settings.shortBreaksBeforeLong
      );
    });
  }

  addButtonListeners(toggleCallback: () => void, resetCallback: () => void): void {
    const startStopButton = this.shadowRoot.querySelector('#start-stop');
    const resetButton = this.shadowRoot.querySelector('#reset');

    if (startStopButton && resetButton) {
      startStopButton.addEventListener('click', toggleCallback);
      resetButton.addEventListener('click', resetCallback);
    } else {
      console.error('Buttons not found in the shadow DOM');
    }
  }

  private getUpdatedSettings(): { [key: string]: number } {
    return {
      workDuration: this.inputElements.workDuration
        ? parseInt(this.inputElements.workDuration.value, 10) || 25
        : 25,
      shortBreakDuration: this.inputElements.shortBreakDuration
        ? parseInt(this.inputElements.shortBreakDuration.value, 10) || 5
        : 5,
      longBreakDuration: this.inputElements.longBreakDuration
        ? parseInt(this.inputElements.longBreakDuration.value, 10) || 15
        : 15,
      shortBreaksBeforeLong: this.inputElements.shortBreaksBeforeLong
        ? parseInt(this.inputElements.shortBreaksBeforeLong.value, 10) || 4
        : 4,
    };
  }
}
