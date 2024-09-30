export class ResourceLoader {
  async fetchResource(url: string): Promise<string> {
    const response = await fetch(new URL(url, import.meta.url));
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    return response.text();
  }
}