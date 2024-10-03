export class ResourceLoader {
  private baseUrl: string;

  constructor(baseUrl: string = import.meta.url) {
    this.baseUrl = baseUrl;
  }

  async fetchResource(path: string): Promise<string> {
    const url = new URL(path, this.baseUrl).href;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.text();
    } catch (error) {
      console.error('Failed to fetch resource:', url, error);
      throw new Error(`Failed to fetch ${path}: ${error}`);
    }
  }

  setBaseUrl(newBaseUrl: string) {
    this.baseUrl = newBaseUrl;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }
}