import { IUrdUIRenderer } from './IUrdUIRenderer.ts';
import { ResourceLoader } from '../../services/ResourceLoader';
import styles from './UrdTimer.css?inline';

export class UrdUIRenderer implements IUrdUIRenderer {
  constructor(
    private shadowRoot: ShadowRoot,
    private resourceLoader: ResourceLoader
  ) {}

  async render(): Promise<void> {
    try {
      const html = await this.resourceLoader.fetchResource('./UrdTimer.html');
      await this.renderContent(html);
      this.renderKeyboardShortcutInfo();
    } catch (error) {
      console.error('Error rendering UI:', error);
    }
  }

  private async renderContent(html: string): Promise<void> {
    const sheet = new CSSStyleSheet();
    await sheet.replace(styles);
    this.shadowRoot.adoptedStyleSheets = [sheet];
    this.shadowRoot.innerHTML = html;
  }

  renderKeyboardShortcutInfo(): void {
    const shortcutInfo = document.createElement('div');
    shortcutInfo.className = 'keyboard-shortcut';
    shortcutInfo.textContent = 'Press space to start/pause';
    this.shadowRoot.appendChild(shortcutInfo);
  }
}
