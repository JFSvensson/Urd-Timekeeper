export class UrdProgressRingService {
  private readonly radius = 140;
  private readonly circumference: number;

  constructor(private shadowRoot: ShadowRoot) {
    this.circumference = 2 * Math.PI * this.radius;
  }

  setupProgressRing(): void {
    const circle = this.shadowRoot.querySelector('.progress-ring__circle') as SVGCircleElement;
    if (!circle) return;

    circle.setAttribute('stroke-dasharray', `${this.circumference} ${this.circumference}`);
    circle.setAttribute('stroke-dashoffset', '0');
  }

  updateProgressRing(timeLeft: number, totalSeconds: number): void {
    const circle = this.shadowRoot.querySelector('.progress-ring__circle') as SVGCircleElement;
    if (!circle) return;

    // Calculate how much of the circle should be VISIBLE (not hidden)
    // When timeLeft = totalSeconds (full time), we want offset = 0 (full circle visible)
    // When timeLeft = 0 (no time), we want offset = -circumference (circle hidden, clockwise)
    const progress = timeLeft / totalSeconds;
    const offset = this.circumference * (progress - 1); // Negative offset for clockwise direction
    
    circle.setAttribute('stroke-dashoffset', offset.toString());
  }

  updateProgressRingColor(sessionType: string): void {
    const progressCircle = this.shadowRoot.querySelector('.progress-ring__circle');
    
    if (progressCircle) {
      let colorClass = '';
      
      switch (sessionType) {
        case 'work':
          colorClass = 'work';
          break;
        case 'shortBreak':
          colorClass = 'short-break';
          break;
        case 'longBreak':
          colorClass = 'long-break';
          break;
      }
      
      progressCircle.classList.remove('work', 'short-break', 'long-break');
      progressCircle.classList.add(colorClass);
    }
  }
}
