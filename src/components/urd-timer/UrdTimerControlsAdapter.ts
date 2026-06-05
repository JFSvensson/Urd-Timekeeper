export class UrdTimerControlsAdapter {
  private startStopButton: HTMLElement | null = null;
  private resetButton: HTMLElement | null = null;
  private onToggleClick: (() => void) | null = null;
  private onResetClick: (() => void) | null = null;

  bind(shadowRoot: ShadowRoot, toggleCallback: () => void, resetCallback: () => void): void {
    this.removeListeners();

    this.startStopButton = shadowRoot.querySelector('#start-stop');
    this.resetButton = shadowRoot.querySelector('#reset');

    if (this.startStopButton && this.resetButton) {
      this.onToggleClick = toggleCallback;
      this.onResetClick = resetCallback;

      this.startStopButton.addEventListener('click', this.onToggleClick);
      this.resetButton.addEventListener('click', this.onResetClick);
    } else {
      console.error('Buttons not found in the shadow DOM');
    }
  }

  removeListeners(): void {
    if (this.startStopButton && this.onToggleClick) {
      this.startStopButton.removeEventListener('click', this.onToggleClick);
    }
    if (this.resetButton && this.onResetClick) {
      this.resetButton.removeEventListener('click', this.onResetClick);
    }

    this.startStopButton = null;
    this.resetButton = null;
    this.onToggleClick = null;
    this.onResetClick = null;
  }
}
