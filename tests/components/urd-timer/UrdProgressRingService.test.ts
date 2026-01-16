import { UrdProgressRingService } from '../../../src/components/urd-timer/UrdProgressRingService';

describe('UrdProgressRingService', () => {
  let progressRingService: UrdProgressRingService;
  let mockShadowRoot: ShadowRoot;
  let circleElement: SVGCircleElement;

  beforeEach(() => {
    // Create mock SVG circle element
    circleElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circleElement.classList.add('progress-ring__circle');

    // Create mock shadow root
    mockShadowRoot = {
      querySelector: jest.fn((selector: string) => {
        if (selector === '.progress-ring__circle') return circleElement;
        return null;
      })
    } as any;

    progressRingService = new UrdProgressRingService(mockShadowRoot);
  });

  describe('setupProgressRing', () => {
    test('should set stroke-dasharray to circumference', () => {
      progressRingService.setupProgressRing();
      
      const radius = 140;
      const circumference = 2 * Math.PI * radius;
      
      expect(circleElement.getAttribute('stroke-dasharray')).toBe(`${circumference} ${circumference}`);
    });

    test('should initialize stroke-dashoffset to 0', () => {
      progressRingService.setupProgressRing();
      expect(circleElement.getAttribute('stroke-dashoffset')).toBe('0');
    });

    test('should not crash if circle element is not found', () => {
      mockShadowRoot.querySelector = jest.fn(() => null);
      expect(() => progressRingService.setupProgressRing()).not.toThrow();
    });
  });

  describe('updateProgressRing', () => {
    test('should set offset to 0 when time is full', () => {
      const totalSeconds = 1500;
      const timeLeft = 1500;
      
      progressRingService.updateProgressRing(timeLeft, totalSeconds);
      
      expect(circleElement.getAttribute('stroke-dashoffset')).toBe('0');
    });

    test('should set negative offset when time is half', () => {
      const totalSeconds = 1500;
      const timeLeft = 750;
      
      progressRingService.updateProgressRing(timeLeft, totalSeconds);
      
      const radius = 140;
      const circumference = 2 * Math.PI * radius;
      const expectedOffset = circumference * (0.5 - 1); // -0.5 * circumference
      
      expect(circleElement.getAttribute('stroke-dashoffset')).toBe(expectedOffset.toString());
    });

    test('should set full negative offset when time is zero', () => {
      const totalSeconds = 1500;
      const timeLeft = 0;
      
      progressRingService.updateProgressRing(timeLeft, totalSeconds);
      
      const radius = 140;
      const circumference = 2 * Math.PI * radius;
      const expectedOffset = -circumference;
      
      expect(circleElement.getAttribute('stroke-dashoffset')).toBe(expectedOffset.toString());
    });

    test('should handle fractional progress correctly', () => {
      const totalSeconds = 300;
      const timeLeft = 100;
      
      progressRingService.updateProgressRing(timeLeft, totalSeconds);
      
      const radius = 140;
      const circumference = 2 * Math.PI * radius;
      const progress = 100 / 300; // 0.333...
      const expectedOffset = circumference * (progress - 1);
      
      expect(circleElement.getAttribute('stroke-dashoffset')).toBe(expectedOffset.toString());
    });

    test('should not crash if circle element is not found', () => {
      mockShadowRoot.querySelector = jest.fn(() => null);
      expect(() => progressRingService.updateProgressRing(100, 300)).not.toThrow();
    });
  });

  describe('updateProgressRingColor', () => {
    test('should set work color class', () => {
      progressRingService.updateProgressRingColor('work');
      
      expect(circleElement.classList.contains('work')).toBe(true);
      expect(circleElement.classList.contains('short-break')).toBe(false);
      expect(circleElement.classList.contains('long-break')).toBe(false);
    });

    test('should set short-break color class', () => {
      progressRingService.updateProgressRingColor('shortBreak');
      
      expect(circleElement.classList.contains('short-break')).toBe(true);
      expect(circleElement.classList.contains('work')).toBe(false);
      expect(circleElement.classList.contains('long-break')).toBe(false);
    });

    test('should set long-break color class', () => {
      progressRingService.updateProgressRingColor('longBreak');
      
      expect(circleElement.classList.contains('long-break')).toBe(true);
      expect(circleElement.classList.contains('work')).toBe(false);
      expect(circleElement.classList.contains('short-break')).toBe(false);
    });

    test('should remove previous color classes when updating', () => {
      circleElement.classList.add('work');
      
      progressRingService.updateProgressRingColor('shortBreak');
      
      expect(circleElement.classList.contains('work')).toBe(false);
      expect(circleElement.classList.contains('short-break')).toBe(true);
    });

    test('should not crash if circle element is not found', () => {
      mockShadowRoot.querySelector = jest.fn(() => null);
      expect(() => progressRingService.updateProgressRingColor('work')).not.toThrow();
    });
  });
});
