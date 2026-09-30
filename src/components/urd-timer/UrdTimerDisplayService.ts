import { SessionStats } from '../../services/SessionHistoryService';

export class UrdTimerDisplayService {
  constructor(private shadowRoot: ShadowRoot) {}

  updateDisplay(timeLeft: number): void {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeDisplay = this.shadowRoot.querySelector('#time-display');
    if (timeDisplay) {
      const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      timeDisplay.textContent = formattedTime;
      timeDisplay.setAttribute(
        'aria-label',
        `Återstående tid ${minutes} minuter ${seconds} sekunder`
      );
    }
  }

  updateStartStopButton(isRunning: boolean): void {
    const button = this.shadowRoot.querySelector('#start-stop');
    if (button) {
      button.textContent = isRunning ? 'Paus' : 'Start';
      button.setAttribute('aria-label', isRunning ? 'Pausa timer' : 'Starta timer');
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

      const text = `${sessionLabel} · Pomodoros: ${sessionCount}`;
      if (sessionInfo.textContent !== text) {
        sessionInfo.textContent = text;
      }
    }
  }

  updateStats(stats: SessionStats): void {
    const statsEl = this.shadowRoot.querySelector('#session-stats');
    if (!statsEl) return;

    statsEl.innerHTML = `
      <div class="stat">
        <span class="stat-value">${stats.today}</span>
        <span class="stat-label">Idag</span>
      </div>
      <div class="stat">
        <span class="stat-value">${stats.thisWeek}</span>
        <span class="stat-label">Denna vecka</span>
      </div>
      <div class="stat">
        <span class="stat-value">${stats.allTime}</span>
        <span class="stat-label">Totalt</span>
      </div>
    `;
  }
}
