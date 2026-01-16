import { UrdUIService } from './UrdUIService';
import { UrdTimerService } from './UrdTimerService';
import { UrdUIRenderer } from './UrdUIRenderer';
import { UrdUIDOMHandler } from './UrdUIDOMHandler';

export class UrdUIServiceFactory {
  static create(shadowRoot: ShadowRoot, timerService: UrdTimerService): UrdUIService {
    const uiRenderer = new UrdUIRenderer(shadowRoot);
    const domHandler = new UrdUIDOMHandler(shadowRoot, timerService);
    return new UrdUIService(shadowRoot, timerService, uiRenderer, domHandler);
  }
}
