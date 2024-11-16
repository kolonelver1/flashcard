//サービスワーカーの登録

const CACHE_NAME = 'flashcard-cache-v1'; // キャッシュ名をバージョン管理
const urlsToCache = [
  '/flashcard/',
  '/flashcard/index.html',
  '/flashcard/styles.css',
  '/flashcard/script.js',
  '/flashcard/manifest.json',
  '/flashcard/icon.png',
  '/flashcard/icon512.png',
  '/flashcard/favicon.ico'
];

// インストールイベント
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // 即座に新しいサービスワーカーを有効化
});

// フェッチイベント
self.addEventListener('fetch', event => {
  if (event.request.method === 'POST') {
    // POST リクエストをキャッシュせず直接ネットワークへ送信
    event.respondWith(fetch(event.request.clone()));
    return;
  }

  // GET リクエストに対してキャッシュ処理
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return (
        cachedResponse ||
        fetch(event.request).then(networkResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            // 静的リソースのみキャッシュ（キャッシュすべきリソースを限定）
            if (
              event.request.url.includes('/flashcard/') && 
              !event.request.url.includes('/api/')
            ) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
        })
      );
    })
  );
});

// アクティベートイベントで古いキャッシュを削除
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName); // 古いキャッシュを削除
          }
        })
      );
    })
  );
  self.clients.claim(); // ページ制御を新しい SW に移行
});
