export function setupCssStyleSheetReplaceMock(): () => void {
  const stylesheetPrototype = CSSStyleSheet.prototype as CSSStyleSheet & {
    replace?: (text: string) => Promise<CSSStyleSheet>;
  };
  const originalReplace = stylesheetPrototype.replace;

  stylesheetPrototype.replace = jest
    .fn<Promise<CSSStyleSheet>, [string]>()
    .mockResolvedValue(undefined as unknown as CSSStyleSheet);

  return () => {
    if (typeof originalReplace === 'undefined') {
      delete stylesheetPrototype.replace;
      return;
    }

    stylesheetPrototype.replace = originalReplace;
  };
}

export function suppressConsoleError(): () => void {
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  return () => {
    consoleErrorSpy.mockRestore();
  };
}
