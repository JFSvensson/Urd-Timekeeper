import { MessageService } from './MessageService';

export class WebPageMessageService implements MessageService {
  private messageElement: HTMLElement | null = null;
  private hasShownNotificationHint: boolean = false;
  private isRequestingPermission: boolean = false;

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
    if (!('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'denied') {
      this.showNotificationHint(
        'Webblasarnotiser ar avstangda. Timern visar fortsatt notiser i appen.'
      );
      return;
    }

    if (Notification.permission === 'default' && !this.isRequestingPermission) {
      this.isRequestingPermission = true;
      Notification.requestPermission()
        .then((permission) => {
          if (permission === 'denied') {
            this.showNotificationHint(
              'Webblasarnotiser nekades. Du kan aktivera dem i webblasarens installningar.'
            );
          }
        })
        .catch(() => {
          this.showNotificationHint(
            'Kunde inte fraga efter webblasarnotiser. Timern fortsatter med inbyggda notiser.'
          );
        })
        .finally(() => {
          this.isRequestingPermission = false;
        });
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
    if (!('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification('Urd Timekeeper', {
        body: message,
        icon: '/favicon.svg',
      });
      return;
    }

    if (Notification.permission === 'default') {
      this.showNotificationHint(
        'Webblasarnotiser ar inte aktiverade an. Timern visar fortsatt notiser i appen.'
      );
      this.requestNotificationPermission();
      return;
    }

    this.showNotificationHint(
      'Webblasarnotiser ar avstangda. Timern visar fortsatt notiser i appen.'
    );
  }

  private showNotificationHint(message: string): void {
    if (this.hasShownNotificationHint) return;
    this.hasShownNotificationHint = true;
    this.showToast(message);
  }
}
