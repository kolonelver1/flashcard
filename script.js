const flashcardContainer = document.getElementById('flashcard-container');

async function fetchFlashcards() {
    try {
      const apiUrl = process.env.NODE_ENV === 'production' 
      ? 'https://my-flashcard-app.herokuapp.com/api/flashcards'  // Herokuの本番環境URL
      : 'https://localhost:3000/api/flashcards';  // ローカル環境URL
    
    const response = await fetch(apiUrl, {
      // 自己署名証明書のエラーを無視する場合、以下のオプションを追加することも可能
      // credentials: 'same-origin',  // Cookieなどを必要とする場合
      headers: {
        'Content-Type': 'application/json',
        // 必要ならばAuthorizationヘッダーを追加
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
        const flashcards = await response.json();
        displayFlashcards(flashcards);
    } catch (error) {
        console.error('Error fetching flashcards:', error);
    }
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').then(registration => {
      console.log('Service Worker registered with scope:', registration.scope);
    }).catch(error => {
      console.error('Service Worker registration failed:', error);
    });
  });
}
