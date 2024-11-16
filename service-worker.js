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
      caches.open(CACHE_NAME).then(cache => {
          return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting(); // 即座に新しいサービスワーカーを有効化
});

// フェッチイベント
self.addEventListener('fetch', event => {
  event.respondWith(
      fetch(event.request).then(networkResponse => {
          // ネットワークレスポンスをキャッシュに保存
          return caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
          });
      }).catch(() => {
          // ネットワークエラー時にキャッシュを返す
          return caches.match(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
      caches.keys().then(cacheNames => {
          return Promise.all(
              cacheNames.map(cacheName => {
                  if (cacheName !== CACHE_NAME) {
                      return caches.delete(cacheName); // 古いキャッシュを削除
                  }
              })
          );
      })
  );
  self.clients.claim(); // ページの制御を新しいサービスワーカーが引き継ぐ
});

