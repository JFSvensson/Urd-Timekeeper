import { MessageService } from './MessageService';

export class WebPageMessageService implements MessageService {
  private messageElement: HTMLElement | null = null;

  constructor() {
    this.createMessageElement();
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

  showMessage(message: string): void {
    if (this.messageElement) {
      this.messageElement.textContent = message;
      this.messageElement.style.display = 'block';
      setTimeout(() => {
        if (this.messageElement) {
          this.messageElement.style.display = 'none';
        }
      }, 3000); // Visa meddelandet i 3 sekunder
    }
  }
}