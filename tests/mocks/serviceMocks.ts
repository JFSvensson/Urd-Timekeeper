export class MockStorageService {
  private storage: { [key: string]: string } = {};

  getItem(key: string): string | null {
    return this.storage[key] || null;
  }

  setItem(key: string, value: string): void {
    this.storage[key] = value;
  }

  removeItem(key: string): void {
    delete this.storage[key];
  }
}

export class MockMessageService {
  showMessage(message: string): void {
    // Implementera vid behov, t.ex. console.log(message);
  }
}