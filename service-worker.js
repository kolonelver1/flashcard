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
  // POST リクエストはキャッシュしない
  if (event.request.method === 'POST') {
      event.respondWith(fetch(event.request));
      return;
  }

  // GET リクエストに対してキャッシュ処理を実行
  event.respondWith(
      caches.match(event.request).then(cachedResponse => {
          return cachedResponse || fetch(event.request).then(networkResponse => {
              // キャッシュに保存
              return caches.open(CACHE_NAME).then(cache => {
                  cache.put(event.request, networkResponse.clone());
                  return networkResponse;
              });
          });
      }).catch(() => {
          // オフライン時の代替処理（オプション）
          return new Response('Offline or error occurred', { status: 503 });
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

