// indexedDB.js

const DB_NAME = "FlashcardDB";
const DB_VERSION = 1;
let db;

// IndexedDBを開く関数
export const openDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      db = event.target.result;
      if (!db.objectStoreNames.contains("flashcards")) {
        const store = db.createObjectStore("flashcards", { keyPath: "id" });
        store.createIndex("question", "question", { unique: false });
        store.createIndex("answer", "answer", { unique: false });
        store.createIndex("nextStudeday", "nextStudeday", { unique: false });
        store.createIndex("Level", "Level", { unique: false });
      }
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
};

// データを保存する関数
export const saveFlashcard = (flashcard) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("flashcards", "readwrite");
    const store = transaction.objectStore("flashcards");
    const request = store.put(flashcard);

    request.onsuccess = () => resolve(true);
    request.onerror = (event) => reject(event.target.error);
  });
};

// すべてのデータを取得する関数
export const getAllFlashcards = () => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("flashcards", "readonly");
    const store = transaction.objectStore("flashcards");
    const request = store.getAll();

    request.onsuccess = (event) => {
      console.log("Retrieved data from IndexedDB:", event.target.result);
      resolve(event.target.result);
    };

    request.onerror = (event) => reject(event.target.error);
  });
};

// IndexedDBのデータを取得してコンソールに表示する関数
// export const logAllFlashcards = async () => {
//   try {
//     await openDatabase();
//     const flashcards = await getAllFlashcards();
//     console.log("All flashcards:", flashcards);
//   } catch (error) {
//     console.error("Error fetching data from IndexedDB:", error);
//   }
// };
