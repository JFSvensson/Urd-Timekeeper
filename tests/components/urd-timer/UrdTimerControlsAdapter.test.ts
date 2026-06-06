/// <reference types="jest" />
import { UrdTimerControlsAdapter } from '../../../src/components/urd-timer/UrdTimerControlsAdapter';

describe('UrdTimerControlsAdapter', () => {
  let host: HTMLElement;
  let shadowRoot: ShadowRoot;
  let adapter: UrdTimerControlsAdapter;

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
    shadowRoot = host.attachShadow({ mode: 'open' });
    adapter = new UrdTimerControlsAdapter();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('binds start and reset click handlers', () => {
    shadowRoot.innerHTML = `
      <button id="start-stop">Start</button>
      <button id="reset">Reset</button>
    `;

    const onToggle = jest.fn();
    const onReset = jest.fn();

    adapter.bind(shadowRoot, onToggle, onReset);

    (shadowRoot.querySelector('#start-stop') as HTMLButtonElement).click();
    (shadowRoot.querySelector('#reset') as HTMLButtonElement).click();

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('does not duplicate handlers when bound repeatedly', () => {
    shadowRoot.innerHTML = `
      <button id="start-stop">Start</button>
      <button id="reset">Reset</button>
    `;

    const onToggle = jest.fn();
    const onReset = jest.fn();

    adapter.bind(shadowRoot, onToggle, onReset);
    adapter.bind(shadowRoot, onToggle, onReset);
    adapter.bind(shadowRoot, onToggle, onReset);

    (shadowRoot.querySelector('#start-stop') as HTMLButtonElement).click();
    (shadowRoot.querySelector('#reset') as HTMLButtonElement).click();

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('removes listeners during cleanup', () => {
    shadowRoot.innerHTML = `
      <button id="start-stop">Start</button>
      <button id="reset">Reset</button>
    `;

    const onToggle = jest.fn();
    const onReset = jest.fn();

    adapter.bind(shadowRoot, onToggle, onReset);
    adapter.removeListeners();

    (shadowRoot.querySelector('#start-stop') as HTMLButtonElement).click();
    (shadowRoot.querySelector('#reset') as HTMLButtonElement).click();

    expect(onToggle).not.toHaveBeenCalled();
    expect(onReset).not.toHaveBeenCalled();
  });
});
