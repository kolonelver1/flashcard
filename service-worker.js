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
  console.log('Installed and opened cache:', CACHE_NAME); // デバッグ用
  self.skipWaiting(); // 即座に新しいサービスワーカーを有効化
});

// フェッチイベント
self.addEventListener('fetch', event => {
  console.log('Fetching:', event.request.url, 'Method:', event.request.method);  // 追加：リクエストのメソッドとURLをログに出力

  if (event.request.method === 'POST') {
    console.log('Handling POST request:', event.request.url); // POSTリクエストを確認

    event.respondWith(
      fetch(event.request.clone())  // POSTリクエストはキャッシュしない
        .then(response => {
          console.log('POST request successful:', event.request.url);  // 成功時のログ
          return response;
        })
        .catch(error => {
          console.error('POST request failed:', error);
          return new Response('POST request failed', { status: 500 });
        })
    );
    return;
  }

  // GET リクエストの処理（コメントアウトした部分）
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request).then(networkResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          if (event.request.method === 'GET') {
            // キャッシュの更新処理
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });
      });
    }).catch(() => {
      return new Response('Offline or error occurred', { status: 503 });
    })
  );
});


// アクティベートイベントで古いキャッシュを削除
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      caches.keys().then(keys => console.log('Caches:', keys));
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
