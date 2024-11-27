// IndexedDBの操作関数
const DB_NAME = "FlashcardDB";
const DB_VERSION = 1;
let db;

// IndexedDBを開く
const openDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      db = event.target.result;
      if (!db.objectStoreNames.contains("flashcards")) {
        const store = db.createObjectStore("flashcards", { keyPath: "id" }); // keyPathを"id"に変更
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

// データを保存する
const saveFlashcard = (flashcard) => {
  return new Promise((resolve, reject) => {
    if (!flashcard.id && flashcard._id) {
      flashcard.id = flashcard._id;
    }

    if (!flashcard.id) {
      console.error("Missing id in flashcard:", flashcard);
      return reject(new Error("Missing id"));
    }

    const transaction = db.transaction("flashcards", "readwrite");
    const store = transaction.objectStore("flashcards");
    const request = store.put(flashcard);

    request.onsuccess = () => resolve(true);
    request.onerror = (event) => reject(event.target.error);
  });
};

// すべてのフラッシュカードを取得する
const getAllFlashcards = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('flashcardsDB', 1);

    request.onerror = function (event) {
      reject('Error opening IndexedDB: ' + event.target.error);
    };

    request.onsuccess = function (event) {
      const db = event.target.result;
      const transaction = db.transaction('flashcards', 'readonly');
      const store = transaction.objectStore('flashcards');
      const allFlashcardsRequest = store.getAll();

      allFlashcardsRequest.onerror = function () {
        reject('Error fetching flashcards from IndexedDB');
      };

      allFlashcardsRequest.onsuccess = function () {
        resolve(allFlashcardsRequest.result);
      };
    };
  });
};

// APIからデータを取得してIndexedDBに保存する関数
const fetchAndSaveData = async () => {
  const apiUrl = "https://my-flashcard-52952319bda7.herokuapp.com/api/flashcards";

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const flashcards = await response.json();

    console.log("Fetched flashcards:", flashcards); // APIから取得したデータを確認

    await openDatabase();

    for (const flashcard of flashcards) {
      await saveFlashcard(flashcard);
    }

    console.log("All data saved to IndexedDB!");
  } catch (error) {
    console.error("Error fetching and saving data:", error);
  }
};

// IndexedDBからデータを取得してフロントエンドで使用するための関数
let flashcards = [];

const fetchFlashcards = async () => {
  try {
    flashcards = await getAllFlashcards(); // データベースから取得
    console.log("All flashcards:", flashcards); // コンソールに表示

    populateStudyDates('studyDatesSelect');
    populateStudyDates('getQuizDate');
    populateStudyLevel('getQuizLevel');
  } catch (error) {
    console.error("Error fetching flashcards from IndexedDB:", error);
  }
};

await fetchFlashcards();

// 初期化処理を行う関数
const initializeData = async () => {
  await openDatabase();  // 1回だけデータベースを開く
  await fetchAndSaveData();  // APIからデータを取得して保存
};

// 初期化
initializeData();
