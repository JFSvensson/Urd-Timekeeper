import './components/urd-timer/UrdTimer';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const serviceWorkerUrl = new URL('service-worker.js', document.baseURI);
    navigator.serviceWorker.register(serviceWorkerUrl).catch((error: unknown) => {
      console.warn('Could not register service worker:', error);
    });
  });
}
