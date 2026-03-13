import { AudioService } from './AudioService';
import { SessionType } from '../components/urd-timer/UrdSessionType';

/**
 * Browser implementation of AudioService using the Web Audio API.
 *
 * Notification sounds are generated programmatically with oscillators
 * so no external audio files are needed.
 */
export class BrowserAudioService implements AudioService {
  private audioContext: AudioContext | null = null;
  private volume: number = 0.5;
  private muted: boolean = false;
  private hasLoggedAudioUnavailable: boolean = false;
  private ambientOscillator: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;

  private getContext(): AudioContext | null {
    if (typeof AudioContext === 'undefined') {
      this.logAudioUnavailable();
      return null;
    }

    if (!this.audioContext) {
      try {
        this.audioContext = new AudioContext();
      } catch (error) {
        this.logAudioUnavailable(error);
        return null;
      }
    }

    return this.audioContext;
  }

  private logAudioUnavailable(error?: unknown): void {
    if (this.hasLoggedAudioUnavailable) return;
    this.hasLoggedAudioUnavailable = true;
    console.warn('Web Audio API unavailable, sound is disabled for this session.', error);
  }

  playNotification(sessionType: SessionType): void {
    if (this.muted) return;

    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    switch (sessionType) {
      case SessionType.Work:
        this.playTone(ctx, now, 523.25, 0.15, 'sine'); // C5
        this.playTone(ctx, now + 0.18, 659.25, 0.15, 'sine'); // E5
        this.playTone(ctx, now + 0.36, 783.99, 0.25, 'sine'); // G5
        break;
      case SessionType.ShortBreak:
        this.playTone(ctx, now, 440.0, 0.3, 'triangle'); // A4
        this.playTone(ctx, now + 0.35, 523.25, 0.3, 'triangle'); // C5
        break;
      case SessionType.LongBreak:
        this.playTone(ctx, now, 392.0, 0.25, 'sine'); // G4
        this.playTone(ctx, now + 0.3, 440.0, 0.25, 'sine'); // A4
        this.playTone(ctx, now + 0.6, 523.25, 0.25, 'sine'); // C5
        this.playTone(ctx, now + 0.9, 659.25, 0.35, 'sine'); // E5
        break;
    }
  }

  playAmbient(): void {
    if (this.muted) return;
    if (this.ambientOscillator) return; // already playing

    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(174.61, ctx.currentTime); // F3 drone
    gain.gain.setValueAtTime(this.volume * 0.08, ctx.currentTime); // very quiet

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();

    this.ambientOscillator = osc;
    this.ambientGain = gain;
  }

  stopAmbient(): void {
    if (this.ambientOscillator) {
      this.ambientOscillator.stop();
      this.ambientOscillator.disconnect();
      this.ambientOscillator = null;
    }
    if (this.ambientGain) {
      this.ambientGain.disconnect();
      this.ambientGain = null;
    }
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.ambientGain) {
      const ctx = this.getContext();
      if (!ctx) return;
      this.ambientGain.gain.setValueAtTime(this.volume * 0.08, ctx.currentTime);
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (muted) {
      this.stopAmbient();
    }
  }

  isMuted(): boolean {
    return this.muted;
  }

  /* ---- private helpers ---- */

  private playTone(
    ctx: AudioContext,
    startTime: number,
    frequency: number,
    duration: number,
    type: OscillatorType
  ): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, startTime);

    gain.gain.setValueAtTime(this.volume * 0.3, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }
}
