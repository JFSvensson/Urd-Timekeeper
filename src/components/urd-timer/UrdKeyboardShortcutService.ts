import { UrdTimerService } from './UrdTimerService';

export class UrdKeyboardShortcutService {
  private handleKeyPress: ((event: KeyboardEvent) => void) | null = null;

  constructor(private timerService: UrdTimerService) {}

  addKeyboardListener(): void {
    this.handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space' || event.key === ' ') {
        event.preventDefault();
        this.timerService.toggle();
      }
    };
    
    document.addEventListener('keydown', this.handleKeyPress);
  }

  removeKeyboardListener(): void {
    if (this.handleKeyPress) {
      document.removeEventListener('keydown', this.handleKeyPress);
      this.handleKeyPress = null;
    }
  }
}
