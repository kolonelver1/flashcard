const flashcardContainer = document.getElementById('flashcard-container');

async function fetchFlashcards() {
    try {
      const apiUrl = 'https://my-flashcard-52952319bda7.herokuapp.com/api/flashcards';
    
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
