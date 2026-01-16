export interface IUrdUIRenderer {
  render(): Promise<void>;
  renderKeyboardShortcutInfo(): void;
}
