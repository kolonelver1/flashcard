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
        const store = db.createObjectStore("flashcards", { keyPath: "_id" }); // _idをkeyPathとして設定
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
    if (!flashcard._id) {
      console.error("Missing _id in flashcard:", flashcard);
      return reject(new Error("Missing _id"));
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
    const transaction = db.transaction("flashcards", "readonly");
    const store = transaction.objectStore("flashcards");
    const request = store.getAll();

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => reject(event.target.error);
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
      console.log("Saving flashcard:", flashcard); // 各flashcardの内容を確認
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
    await openDatabase();
    flashcards = await getAllFlashcards(); // IndexedDBからデータを取得
    console.log("Retrieved flashcards:", flashcards);
  } catch (error) {
    console.error("Error fetching flashcards from IndexedDB:", error);
  }
};

// 初期化処理を行う関数
const initializeData = async () => {
  // 1. APIからデータを取得してIndexedDBに保存
  await fetchAndSaveData();

  // 2. IndexedDBからデータを取得してフロントエンドで利用
  await fetchFlashcards();

  // flashcardsにはIndexedDBのデータが入っている
  console.log(flashcards); // ここでグローバル変数flashcardsを使う
};

// 初期化
initializeData();
