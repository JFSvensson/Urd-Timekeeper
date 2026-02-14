import { UrdUIRenderer } from '../../../src/components/urd-timer/UrdUIRenderer';

describe('UrdUIRenderer', () => {
  let shadowRoot: ShadowRoot;
  let renderer: UrdUIRenderer;

  beforeEach(() => {
    // Mock CSSStyleSheet.replace for jsdom compatibility
    if (typeof CSSStyleSheet.prototype.replace === 'undefined') {
      CSSStyleSheet.prototype.replace = jest.fn().mockResolvedValue(undefined);
    }

    // Create a container element
    const container = document.createElement('div');
    document.body.appendChild(container);

    // Create shadow root
    shadowRoot = container.attachShadow({ mode: 'open' });

    // Create renderer instance
    renderer = new UrdUIRenderer(shadowRoot);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('render', () => {
    it('should render content successfully', async () => {
      await renderer.render();

      // Verify that content was rendered
      expect(shadowRoot.innerHTML).not.toBe('');
      expect(shadowRoot.adoptedStyleSheets.length).toBeGreaterThan(0);
    });

    it('should render HTML content in shadow root', async () => {
      await renderer.render();

      // Check that HTML was added
      expect(shadowRoot.innerHTML).toContain('div');
    });

    it('should adopt CSS stylesheets', async () => {
      await renderer.render();

      // Verify adopted stylesheets
      expect(shadowRoot.adoptedStyleSheets).toBeDefined();
      expect(shadowRoot.adoptedStyleSheets.length).toBe(1);
    });

    it('should render keyboard shortcut info', async () => {
      await renderer.render();

      // Find the keyboard shortcut element
      const shortcutElement = shadowRoot.querySelector('.keyboard-shortcut');
      expect(shortcutElement).toBeTruthy();
      expect(shortcutElement?.textContent).toBe('Tryck mellanslag för att starta/pausa');
    });

    it('should handle rendering errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Force an error by providing invalid shadowRoot
      const invalidRenderer = new UrdUIRenderer(null as any);

      await invalidRenderer.render();

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error rendering UI:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });

  describe('renderKeyboardShortcutInfo', () => {
    it('should create keyboard shortcut info element', () => {
      renderer.renderKeyboardShortcutInfo();

      const shortcutElement = shadowRoot.querySelector('.keyboard-shortcut');
      expect(shortcutElement).toBeTruthy();
    });

    it('should set correct class name', () => {
      renderer.renderKeyboardShortcutInfo();

      const shortcutElement = shadowRoot.querySelector('.keyboard-shortcut');
      expect(shortcutElement?.className).toBe('keyboard-shortcut');
    });

    it('should set correct text content', () => {
      renderer.renderKeyboardShortcutInfo();

      const shortcutElement = shadowRoot.querySelector('.keyboard-shortcut');
      expect(shortcutElement?.textContent).toBe('Tryck mellanslag för att starta/pausa');
    });

    it('should append element to shadow root', () => {
      const initialChildCount = shadowRoot.childNodes.length;

      renderer.renderKeyboardShortcutInfo();

      expect(shadowRoot.childNodes.length).toBe(initialChildCount + 1);
    });

    it('should create multiple elements if called multiple times', () => {
      renderer.renderKeyboardShortcutInfo();
      renderer.renderKeyboardShortcutInfo();

      const shortcutElements = shadowRoot.querySelectorAll('.keyboard-shortcut');
      expect(shortcutElements.length).toBe(2);
    });
  });

  describe('integration', () => {
    it('should have keyboard shortcut info after full render', async () => {
      await renderer.render();

      const shortcutElements = shadowRoot.querySelectorAll('.keyboard-shortcut');
      // After render(), there should be exactly one keyboard shortcut element
      expect(shortcutElements.length).toBe(1);
    });

    it('should have both HTML content and styles after render', async () => {
      await renderer.render();

      // Check HTML content exists
      expect(shadowRoot.innerHTML).not.toBe('');

      // Check styles are adopted
      expect(shadowRoot.adoptedStyleSheets.length).toBeGreaterThan(0);

      // Check keyboard shortcut info is present
      const shortcutElement = shadowRoot.querySelector('.keyboard-shortcut');
      expect(shortcutElement).toBeTruthy();
    });

    it('should maintain shadow root integrity after render', async () => {
      await renderer.render();

      // Shadow root should still be accessible
      expect(shadowRoot).toBeDefined();
      expect(shadowRoot.host).toBeDefined();
    });
  });
});
