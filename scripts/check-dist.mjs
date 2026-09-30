import { readFile } from 'node:fs/promises';
import { access } from 'node:fs/promises';
import { resolve } from 'node:path';

const distDirectory = resolve('dist');
const requiredFiles = [
  'index.html',
  'overlay.html',
  'manifest.json',
  'favicon.svg',
  'service-worker.js',
];

for (const fileName of requiredFiles) {
  await access(resolve(distDirectory, fileName));
}

const indexHtml = await readFile(resolve(distDirectory, 'index.html'), 'utf8');
const overlayHtml = await readFile(resolve(distDirectory, 'overlay.html'), 'utf8');
const manifest = JSON.parse(await readFile(resolve(distDirectory, 'manifest.json'), 'utf8'));
const serviceWorker = await readFile(resolve(distDirectory, 'service-worker.js'), 'utf8');

if (!indexHtml.includes('./manifest.json') || !indexHtml.includes('./favicon.svg')) {
  throw new Error('index.html must use relative manifest and favicon URLs');
}

if (!overlayHtml.includes('./favicon.svg')) {
  throw new Error('overlay.html must use a relative favicon URL');
}

if (manifest.start_url !== './' || manifest.icons?.[0]?.src !== './favicon.svg') {
  throw new Error('manifest.json must use relative PWA URLs');
}

if (!serviceWorker.includes("'./index.html'") || !serviceWorker.includes("'./overlay.html'")) {
  throw new Error('service-worker.js must cache the relative app shell URLs');
}

console.log(`dist smoke check passed: ${requiredFiles.length} required files verified`);
