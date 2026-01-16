import { UrdUIService } from './UrdUIService';
import { UrdTimerService } from './UrdTimerService';
import { UrdUIRenderer } from './UrdUIRenderer';
import { UrdUIDOMHandler } from './UrdUIDOMHandler';
import { ResourceLoader } from '../../services/ResourceLoader';

export class UrdUIServiceFactory {
  static create(shadowRoot: ShadowRoot, timerService: UrdTimerService, baseUrl: string): UrdUIService {
    const resourceLoader = new ResourceLoader(baseUrl);
    const uiRenderer = new UrdUIRenderer(shadowRoot, resourceLoader);
    const domHandler = new UrdUIDOMHandler(shadowRoot, timerService);
    return new UrdUIService(shadowRoot, timerService, uiRenderer, domHandler);
  }
}
