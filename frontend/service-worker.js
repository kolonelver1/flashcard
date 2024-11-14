//サービスワーカーの登録

self.addEventListener('install', event => {
  event.waitUntil(
      caches.open('flashcard-cache').then(cache => {
          return cache.addAll([
              '/',
              '/index.html',
              '/styles.css',
              '/script.js',
              '/manifest.json',
              '/icon.png',
              '/icon512.png' // アイコンのパスを指定
          ]);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
      caches.match(event.request).then(response => {
          return response || fetch(event.request);
      })
  );
});
