const flashcardContainer = document.getElementById('flashcard-container');

async function fetchFlashcards() {
    try {
        const response = await fetch('https://localhost:3000/api/flashcards');
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
