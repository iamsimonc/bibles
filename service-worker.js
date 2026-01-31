const CACHE_NAME = 'bible-pwa-v4';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './books.js',
  './bible.txt',
  './manifest.json'
  // 注意：請確保 icon-192.png 和 icon-512.png 真的存在，否則會報錯
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('正在預載入快取資源...');
        // 使用 addAll 會要求所有資源都必須存在，否則失敗
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// 策略：Network First (優先抓取最新數據，斷網時使用快取)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 如果網路正常，複製一份存入快取
        if (response.status === 200) {
          const resCopy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, resCopy));
        }
        return response;
      })
      .catch(() => {
        // 斷網時從快取中尋找
        return caches.match(event.request);
      })
  );
});
