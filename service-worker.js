//サービスワーカーの登録

const CACHE_NAME = 'flashcard-cache-v1'; // キャッシュ名をバージョン管理
const urlsToCache = [
  '/flashcard/',             // ルート (GitHub Pagesではリポジトリ名を考慮)
  '/flashcard/index.html',   // HTML
  '/flashcard/styles.css',   // CSS
  '/flashcard/script.js',    // JavaScript
  '/flashcard/manifest.json',// PWAのマニフェスト
  '/flashcard/icon.png',     // アイコン
  '/flashcard/icon512.png',  // 大きいアイコン
  '/flashcard/favicon.ico'   // ファビコン
];

// インストールイベント
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Failed to cache resources:', error);
      })
  );
  self.skipWaiting(); // 即座に新しい SW を有効化
});

// フェッチイベント
self.addEventListener('fetch', event => {
  event.respondWith(
      fetch(event.request)
          .then(networkResponse => {
              return caches.open(CACHE_NAME).then(cache => {
                  cache.put(event.request, networkResponse.clone());
                  return networkResponse;
              });
          })
          .catch(() => {
              return caches.match(event.request);
          })
  );
});


// 古いキャッシュを削除するためのアクティベートイベント
self.addEventListener('activate', event => {
  event.waitUntil(
      caches.keys().then(cacheNames => {
          return Promise.all(
              cacheNames.map(cacheName => {
                  if (cacheName !== CACHE_NAME) {
                      console.log('Deleting old cache:', cacheName);
                      return caches.delete(cacheName);
                  }
              })
          );
      })
  );
  self.clients.claim(); // 新しい SW がすぐに制御を開始
});


