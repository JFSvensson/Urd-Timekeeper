import { MessageService } from './MessageService';

export class NoOpMessageService implements MessageService {
  showMessage(_message: string): void {
    // Intentionally no-op for contexts where user messaging is disabled.
  }
}
