import { IUrdUIRenderer } from './IUrdUIRenderer';
import styles from './UrdTimer.css?inline';
import htmlContent from './UrdTimer.html?raw';

export class UrdUIRenderer implements IUrdUIRenderer {
  constructor(
    private shadowRoot: ShadowRoot
  ) {}

  async render(): Promise<void> {
    try {
      await this.renderContent(htmlContent);
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
    shortcutInfo.textContent = 'Tryck mellanslag för att starta/pausa';
    this.shadowRoot.appendChild(shortcutInfo);
  }
}
