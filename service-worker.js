// キャッシュ名をバージョン管理
const CACHE_NAME = 'flashcard-cache-v1'; // キャッシュ名をバージョン管理

// 設定するファイルを選択
const urlsToCache = [
  '/flashcard/index.html',
  '/flashcard/quiz.html',
  '/flashcard/answer.html',
  '/flashcard/add.js',
  '/flashcard/api.js',
  '/flashcard/indexedDB.js',
  '/flashcard/quiz.js',
  '/flashcard/answer.js',
  '/flashcard/server.js',
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
      return cache.addAll(urlsToCache); // 初回キャッシュ
    })
  );
  console.log('Installed and opened cache:', CACHE_NAME); // デバッグ用
  self.skipWaiting(); // 即座に新しいサービスワーカーを有効化
});

// フェッチイベント
self.addEventListener('fetch', event => {
  console.log('Fetching:', event.request.url, 'Method:', event.request.method);

  // POSTリクエストに関しては、必ず新しいデータを取得
  if (event.request.method === 'POST' || event.request.method === 'PUT') {
    console.log('Handling POST/PUT request:', event.request.url);

    event.respondWith(
      fetch(event.request.clone(), {
        credentials: 'include',
        cache: 'no-cache'  // キャッシュを使用せず、常に最新データを取得
      })
        .then(response => {
          const headers = new Headers(response.headers);
          headers.set('Access-Control-Allow-Origin', 'https://kolonelver1.github.io');
          headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE');
          headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

          const clonedResponse = new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: headers
          });

          return clonedResponse;
        })
        .catch(error => {
          console.error('POST/PUT request failed:', error);
          return new Response('POST/PUT request failed', { status: 500 });
        })
    );
    return;
  }

  // その他のリクエスト（GETなど）
  event.respondWith(
    fetch(event.request, {
      credentials: 'include'  // 認証情報を含める
    })
      .then(response => {
        const headers = new Headers(response.headers);
        headers.set('Access-Control-Allow-Origin', 'https://kolonelver1.github.io');
        headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE');
        headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        const clonedResponse = new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: headers
        });

        return clonedResponse;
      })
      .catch(error => {
        console.error('Request failed:', error);
        return new Response('Request failed', { status: 500 });
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
            console.log('Deleting old cache:', cacheName); // 古いキャッシュを削除
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // 新しいSWが即座に制御を始めるようにする
});
