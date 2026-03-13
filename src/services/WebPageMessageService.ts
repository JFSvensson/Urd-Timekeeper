import { MessageService } from './MessageService';

export class WebPageMessageService implements MessageService {
  private messageElement: HTMLElement | null = null;

  constructor() {
    this.createMessageElement();
    this.requestNotificationPermission();
  }

  private createMessageElement() {
    this.messageElement = document.createElement('div');
    this.messageElement.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: #f0f0f0;
      border: 1px solid #ccc;
      padding: 10px;
      border-radius: 5px;
      display: none;
    `;
    document.body.appendChild(this.messageElement);
  }

  private requestNotificationPermission(): void {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  showMessage(message: string): void {
    this.showToast(message);
    this.showBrowserNotification(message);
  }

  private showToast(message: string): void {
    if (this.messageElement) {
      this.messageElement.textContent = message;
      this.messageElement.style.display = 'block';
      setTimeout(() => {
        if (this.messageElement) {
          this.messageElement.style.display = 'none';
        }
      }, 3000);
    }
  }

  private showBrowserNotification(message: string): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Urd Timekeeper', {
        body: message,
        icon: '/favicon.svg',
      });
    }
  }
}
