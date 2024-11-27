const DB_NAME = "FlashcardDB";
const DB_VERSION = 1;
let db;

// IndexedDBを開く関数
const openDatabase = () => {
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
const saveFlashcard = (flashcard) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("flashcards", "readwrite");
    const store = transaction.objectStore("flashcards");
    const request = store.put(flashcard);

    request.onsuccess = () => resolve(true);
    request.onerror = (event) => reject(event.target.error);
  });
};

// APIサーバーからデータを取得しIndexedDBに保存する関数
const fetchAndSaveData = async () => {
  const apiUrl = "https://my-flashcard-52952319bda7.herokuapp.com/api/flashcards";

  try {
    // APIサーバーからデータを取得
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const flashcards = await response.json();

    // データベースを開く
    await openDatabase();

    // 各データをIndexedDBに保存
    for (const flashcard of flashcards) {
      await saveFlashcard(flashcard);
    }

    console.log("All data saved to IndexedDB!");
  } catch (error) {
    console.error("Error fetching and saving data:", error);
  }
};

// 実行
fetchAndSaveData();

