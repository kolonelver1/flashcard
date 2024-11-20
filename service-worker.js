//サービスワーカーの登録

const CACHE_NAME = 'flashcard-cache-v1'; // キャッシュ名をバージョン管理

//設定するファイルを選択
const urlsToCache = [
  '/flashcard/index.html',
  '/flashcard/quiz.html',
  '/flashcard/answer.html',
  '/flashcard/add.js',
  '/flashcard/quiz.js',
  '/flashcard/answer.js',
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

//フェッチイベント
self.addEventListener('fetch', event => {
  console.log('Fetching:', event.request.url, 'Method:', event.request.method);

  if (event.request.method === 'POST') {
    console.log('Handling POST request:', event.request.url);

    event.respondWith(
      fetch(event.request.clone())  // POSTリクエストはキャッシュしない
        .then(response => {
          // レスポンスのヘッダーをコピー
          const headers = new Headers(response.headers);
          // 新しいヘッダーを追加
          headers.set('Access-Control-Allow-Origin', 'https://kolonelver1.github.io');  // 任意のオリジンを許可
          headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE');  // 許可するメソッド
          headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');  // 許可するヘッダー

          // 新しいレスポンスを作成
          const clonedResponse = new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: headers  // 修正したヘッダーを設定
          });

          console.log('POST request successful:', event.request.url);
          return clonedResponse;  // 新しいレスポンスを返す
        })
        .catch(error => {
          console.error('POST request failed:', error);
          return new Response('POST request failed', { status: 500 });
        })
    );
    return;
  }

  // その他のリクエスト
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // レスポンスのヘッダーをコピー
        const headers = new Headers(response.headers);
        // 新しいヘッダーを追加
        headers.set('Access-Control-Allow-Origin', 'https://kolonelver1.github.io');
        headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE');
        headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        // 新しいレスポンスを作成
        const clonedResponse = new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: headers  // 修正したヘッダーを設定
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
