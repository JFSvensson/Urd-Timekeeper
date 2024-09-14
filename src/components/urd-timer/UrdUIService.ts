import { UrdTimerObserver } from './UrdTimerObserver';

export class UrdUIService implements UrdTimerObserver {
  private currentTimeLeft: number = 25 * 60;

  constructor(private shadowRoot: ShadowRoot | null) {}

  async render() {
    try {
      const [style, html] = await Promise.all([
        this.fetchResource('./UrdTimer.css'),
        this.fetchResource('./UrdTimer.html')
      ]);

      if (this.shadowRoot) {
        this.shadowRoot.innerHTML = `<style>${style}</style>${html}`;
      }
    } catch (error) {
      console.error('Error in render:', error);
    }
    this.update(25 * 60, false);
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
        startStopButton.textContent = this.currentTimeLeft === 25 * 60 ? 'Start' : 'Resume';
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
