export interface MessageService {
  showMessage(message: string): void;
  requestPermission?(): void;
}
