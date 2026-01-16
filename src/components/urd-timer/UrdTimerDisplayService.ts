export class UrdTimerDisplayService {
  constructor(private shadowRoot: ShadowRoot) {}

  updateDisplay(timeLeft: number): void {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeDisplay = this.shadowRoot.querySelector('#time-display');
    if (timeDisplay) {
      timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }

  updateStartStopButton(isRunning: boolean): void {
    const button = this.shadowRoot.querySelector('#start-stop');
    if (button) {
      button.textContent = isRunning ? 'Pause' : 'Start';
    }
  }

  updateSessionInfo(sessionType: string, sessionCount: number): void {
    const sessionInfo = this.shadowRoot.querySelector('#session-info');
    
    if (sessionInfo) {
      let sessionLabel = '';
      
      switch (sessionType) {
        case 'work':
          sessionLabel = 'Arbete';
          break;
        case 'shortBreak':
          sessionLabel = 'Kort paus';
          break;
        case 'longBreak':
          sessionLabel = 'Lång paus';
          break;
      }
      
      sessionInfo.textContent = `${sessionLabel} · Pomodoros: ${sessionCount}`;
    }
  }
}
