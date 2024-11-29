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
        const store = db.createObjectStore("flashcards", { keyPath: "id" });
        store.createIndex("question", "question", { unique: false });
        store.createIndex("answer", "answer", { unique: false });
        store.createIndex("nextStudeday", "nextStudeday", { unique: false });
        store.createIndex("Level", "Level", { unique: false });
      }
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      console.log("Database opened successfully");
      resolve(db);
    };

    request.onerror = (event) => {
      console.error("Failed to open database:", event.target.error);
      reject(event.target.error);
    };
  });
};

// すべてのフラッシュカードを取得する
const getAllFlashcards = async () => {
  return new Promise((resolve, reject) => {
    openDatabase().then(db => {
      const transaction = db.transaction("flashcards", "readonly");
      const store = transaction.objectStore("flashcards");
      const request = store.getAll();

      request.onerror = function () {
        console.error("Error fetching flashcards from IndexedDB");
        reject("Error fetching flashcards from IndexedDB");
      };

      request.onsuccess = function () {
        console.log("Fetched flashcards:", request.result);
        resolve(request.result);
      };
    }).catch(error => {
      console.error("Failed to open database for fetching flashcards:", error);
      reject("Failed to open database for fetching flashcards");
    });
  });
};

/**
 * フラッシュカードを IndexedDB に保存する関数
 * @param {Object} flashcard - 保存するフラッシュカードデータ
 */
export async function saveFlashcard(flashcard) {
  return new Promise((resolve, reject) => {
    const dbRequest = indexedDB.open('flashcardDB', 1);

    dbRequest.onerror = (event) => {
      console.error('IndexedDB オープンエラー:', event.target.error);
      reject(event.target.error);
    };

    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction('flashcards', 'readwrite');
      const store = transaction.objectStore('flashcards');

      // _idがない場合、Date.now()で一意なIDを生成
      if (!flashcard._id) {
        flashcard._id = Date.now();
      }

      const addRequest = store.add(flashcard); // データを追加

      addRequest.onsuccess = () => {
        console.log('IndexedDB にデータを保存しました:', flashcard);
        resolve();
      };

      addRequest.onerror = (event) => {
        console.error('IndexedDB 保存エラー:', event.target.error);
        reject(event.target.error);
      };
    };

    dbRequest.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('flashcards')) {
        db.createObjectStore('flashcards', { keyPath: '_id' }); // _idをキーとして使用
      }
    };
  });
}

// IndexedDBから複数のフラッシュカードを削除
const deleteFlashcardsFromIndexedDB = async (itemsToDelete) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("flashcards", "readwrite");
    const store = transaction.objectStore("flashcards");

    // 選択されたアイテムを1つずつ削除
    let deleteCount = 0;
    itemsToDelete.forEach(id => {
      const request = store.delete(id);
      request.onsuccess = () => {
        deleteCount++;
        if (deleteCount === itemsToDelete.length) {
          resolve();
        }
      };
      request.onerror = (event) => {
        console.error("IndexedDB削除エラー:", event.target.error);
        reject(event.target.error);
      };
    });
  });
};

export const updateFlashcardInIndexedDB = async (updatedFlashcard) => {
  try {
    const db = await openDatabase();
    const tx = db.transaction('flashcards', 'readwrite');
    const store = tx.objectStore('flashcards');

    // 更新データを保存
    await store.put(updatedFlashcard);
    await tx.complete;
    console.log('Flashcard updated in IndexedDB:', updatedFlashcard);
    
    // 更新後にフラッシュカードを再取得
    const updatedFlashcards = await getAllFlashcards();
    console.log('Updated Flashcards:', updatedFlashcards);
  } catch (error) {
    console.error('Failed to update flashcard in IndexedDB:', error);
  }
};


// openDatabase と getAllFlashcards をエクスポート
export { openDatabase, getAllFlashcards, deleteFlashcardsFromIndexedDB };
