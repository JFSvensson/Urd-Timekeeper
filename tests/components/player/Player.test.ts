import { Player } from '../../../src/components/player/Player';
import { AudioService } from '../../../src/services/AudioService';
import { SessionType } from '../../../src/components/urd-timer/UrdSessionType';

// Mock the ?raw and ?inline imports
jest.mock('../../../src/components/player/Player.html?raw', () => {
  return `<div class="player">
    <div class="player-controls">
      <button id="mute-toggle" class="player-btn" title="Ljud på/av">
        <span id="mute-icon">🔊</span>
      </button>
      <label class="volume-wrapper" for="volume-slider">
        <input type="range" id="volume-slider" min="0" max="100" value="50" class="volume-slider" title="Volym" />
      </label>
      <button id="ambient-toggle" class="player-btn" title="Bakgrundsljud på/av">
        <span id="ambient-icon">🎵</span>
      </button>
    </div>
  </div>`;
});
jest.mock('../../../src/components/player/Player.css?inline', () => '.player {}');

class MockAudioService implements AudioService {
  private muted = false;
  playNotification = jest.fn((_sessionType: SessionType) => {});
  playAmbient = jest.fn();
  stopAmbient = jest.fn();
  setVolume = jest.fn();
  setMuted = jest.fn((m: boolean) => {
    this.muted = m;
  });
  isMuted = jest.fn(() => this.muted);
}

// Register the custom element once
if (!customElements.get('urd-player')) {
  customElements.define('urd-player', Player);
}

// Mock CSSStyleSheet.replace for jsdom compatibility
if (typeof CSSStyleSheet.prototype.replace === 'undefined') {
  CSSStyleSheet.prototype.replace = jest.fn().mockResolvedValue(undefined);
}

describe('Player', () => {
  let player: Player;
  let mockAudio: MockAudioService;

  beforeEach(async () => {
    mockAudio = new MockAudioService();
    player = new Player();
    document.body.appendChild(player);

    // Wait for connectedCallback to complete
    await new Promise((r) => setTimeout(r, 0));

    player.setAudioService(mockAudio);
  });

  afterEach(() => {
    document.body.removeChild(player);
  });

  test('should render shadow DOM', () => {
    expect(player.shadowRoot).toBeTruthy();
    expect(player.shadowRoot?.querySelector('#mute-toggle')).toBeTruthy();
    expect(player.shadowRoot?.querySelector('#volume-slider')).toBeTruthy();
    expect(player.shadowRoot?.querySelector('#ambient-toggle')).toBeTruthy();
  });

  test('should toggle mute on button click', () => {
    const muteBtn = player.shadowRoot?.querySelector('#mute-toggle') as HTMLButtonElement;
    muteBtn.click();

    expect(mockAudio.setMuted).toHaveBeenCalledWith(true);
  });

  test('should update mute icon when muted', () => {
    const muteBtn = player.shadowRoot?.querySelector('#mute-toggle') as HTMLButtonElement;
    muteBtn.click();

    const icon = player.shadowRoot?.querySelector('#mute-icon') as HTMLSpanElement;
    expect(icon.textContent).toBe('🔇');
  });

  test('should unmute on second click', () => {
    const muteBtn = player.shadowRoot?.querySelector('#mute-toggle') as HTMLButtonElement;
    muteBtn.click(); // mute
    muteBtn.click(); // unmute

    expect(mockAudio.setMuted).toHaveBeenCalledTimes(2);
    expect(mockAudio.setMuted).toHaveBeenLastCalledWith(false);
  });

  test('should update volume via slider', () => {
    const slider = player.shadowRoot?.querySelector('#volume-slider') as HTMLInputElement;
    slider.value = '80';
    slider.dispatchEvent(new Event('input'));

    expect(mockAudio.setVolume).toHaveBeenCalledWith(0.8);
  });

  test('should toggle ambient sound', () => {
    const ambientBtn = player.shadowRoot?.querySelector('#ambient-toggle') as HTMLButtonElement;
    ambientBtn.click();

    expect(mockAudio.playAmbient).toHaveBeenCalledTimes(1);
  });

  test('should stop ambient on second click', () => {
    const ambientBtn = player.shadowRoot?.querySelector('#ambient-toggle') as HTMLButtonElement;
    ambientBtn.click(); // start
    ambientBtn.click(); // stop

    expect(mockAudio.playAmbient).toHaveBeenCalledTimes(1);
    expect(mockAudio.stopAmbient).toHaveBeenCalledTimes(1);
  });

  test('should not toggle ambient when muted', () => {
    // Mute first
    mockAudio.setMuted(true);

    const ambientBtn = player.shadowRoot?.querySelector('#ambient-toggle') as HTMLButtonElement;
    ambientBtn.click();

    expect(mockAudio.playAmbient).not.toHaveBeenCalled();
  });

  test('should sync UI when audioService is set', () => {
    // Already set in beforeEach, mute icon should show unmuted
    const icon = player.shadowRoot?.querySelector('#mute-icon') as HTMLSpanElement;
    expect(icon.textContent).toBe('🔊');
  });
});
