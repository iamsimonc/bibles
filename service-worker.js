const CACHE_NAME = 'bible-pwa-v1';
const FILES_TO_CACHE = [
  './',
  './index.html',
  './bible.txt',
  './books.js',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});