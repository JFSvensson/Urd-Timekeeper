import { AudioService } from '../../services/AudioService';
import htmlContent from './Player.html?raw';
import styles from './Player.css?inline';

export class Player extends HTMLElement {
  private audioService: AudioService | null = null;
  private muteButton: HTMLButtonElement | null = null;
  private muteIcon: HTMLSpanElement | null = null;
  private volumeSlider: HTMLInputElement | null = null;
  private ambientButton: HTMLButtonElement | null = null;
  private ambientIcon: HTMLSpanElement | null = null;
  private ambientPlaying: boolean = false;

  async connectedCallback(): Promise<void> {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }
    await this.render();
    this.initializeElements();
    this.addEventListeners();
  }

  /**
   * Inject the AudioService after construction (called by parent component).
   */
  setAudioService(audioService: AudioService): void {
    this.audioService = audioService;
    this.syncUI();
  }

  private async render(): Promise<void> {
    if (!this.shadowRoot) return;
    const sheet = new CSSStyleSheet();
    await sheet.replace(styles);
    this.shadowRoot.adoptedStyleSheets = [sheet];
    this.shadowRoot.innerHTML = htmlContent;
  }

  private initializeElements(): void {
    if (!this.shadowRoot) return;
    this.muteButton = this.shadowRoot.querySelector('#mute-toggle');
    this.muteIcon = this.shadowRoot.querySelector('#mute-icon');
    this.volumeSlider = this.shadowRoot.querySelector('#volume-slider');
    this.ambientButton = this.shadowRoot.querySelector('#ambient-toggle');
    this.ambientIcon = this.shadowRoot.querySelector('#ambient-icon');
  }

  private addEventListeners(): void {
    this.muteButton?.addEventListener('click', () => this.toggleMute());
    this.volumeSlider?.addEventListener('input', (e) => this.onVolumeChange(e));
    this.ambientButton?.addEventListener('click', () => this.toggleAmbient());
  }

  private toggleMute(): void {
    if (!this.audioService) return;
    const newMuted = !this.audioService.isMuted();
    this.audioService.setMuted(newMuted);
    this.updateMuteUI(newMuted);

    if (newMuted && this.ambientPlaying) {
      this.ambientPlaying = false;
      this.updateAmbientUI();
    }
  }

  private onVolumeChange(e: Event): void {
    const value = parseInt((e.target as HTMLInputElement).value, 10);
    const volume = value / 100;
    this.audioService?.setVolume(volume);
  }

  private toggleAmbient(): void {
    if (!this.audioService) return;
    if (this.audioService.isMuted()) return;

    if (this.ambientPlaying) {
      this.audioService.stopAmbient();
    } else {
      this.audioService.playAmbient();
    }
    this.ambientPlaying = !this.ambientPlaying;
    this.updateAmbientUI();
  }

  private syncUI(): void {
    if (!this.audioService) return;
    this.updateMuteUI(this.audioService.isMuted());
  }

  private updateMuteUI(muted: boolean): void {
    if (this.muteIcon) {
      this.muteIcon.textContent = muted ? '🔇' : '🔊';
    }
    if (this.volumeSlider) {
      this.volumeSlider.classList.toggle('muted', muted);
    }
  }

  private updateAmbientUI(): void {
    if (this.ambientIcon) {
      this.ambientIcon.textContent = this.ambientPlaying ? '🎶' : '🎵';
    }
    this.ambientButton?.classList.toggle('active', this.ambientPlaying);
  }
}

if (!customElements.get('urd-player')) {
  customElements.define('urd-player', Player);
}
