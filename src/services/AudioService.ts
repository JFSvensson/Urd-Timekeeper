import { SessionType } from '../components/urd-timer/UrdSessionType';

export interface AudioService {
  /** Play a notification sound when a session ends/starts. */
  playNotification(sessionType: SessionType): void;

  /** Start looping ambient background sound. */
  playAmbient(): void;

  /** Stop ambient background sound. */
  stopAmbient(): void;

  /** Set master volume (0.0 – 1.0). */
  setVolume(volume: number): void;

  /** Mute / unmute all audio. */
  setMuted(muted: boolean): void;

  /** Whether audio is currently muted. */
  isMuted(): boolean;
}
