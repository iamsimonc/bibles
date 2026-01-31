// service-worker.js
const CACHE_NAME = 'bible-pwa-v3'; // 每次修改 index.html 或重要資源時更新版本號
const ASSETS_TO_CACHE = [
  '/', // 根目錄，也就是 index.html
  '/index.html',
  '/styles.css',
  '/app.js',
  '/logo.png',
  // 其他靜態資源
];

// 安裝事件：快取靜態資源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting()) // 立即啟用新的 SW
  );
});

// 啟用事件：清理舊快取
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => 
      Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      )
    )
  );
  self.clients.claim(); // 立即控制所有頁面
});

// 抓取事件
self.addEventListener('fetch', event => {
  const request = event.request;

  // 如果是導航請求（通常是刷新頁面）
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(networkResponse => {
          // 成功抓到網路資源就更新快取
          return caches.open(CACHE_NAME).then(cache => {
            cache.put('index.html', networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // 網路失敗時用快取
          return caches.match('index.html');
        })
    );
    return;
  }

  // 其他資源走 Cache First
  event.respondWith(
    caches.match(request).then(cached => {
      return cached || fetch(request).then(networkResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(request, networkResponse.clone());
          return networkResponse;
        });
      });
    })
  );
});