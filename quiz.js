'use strict'; // エラーあれば表示、必ず先頭

let dateParam = [];  // グローバルに宣言
let flashcards = [];

// add.js の最初に indexedDB.js から openDatabase をインポート
import { openDatabase, getAllFlashcards, updateFlashcardInDB } from './indexedDB.js';

// IndexedDBからフラッシュカードを取得
const fetchFlashcards = async () => {
  try {
    // データベースが開かれていることを確認
    await openDatabase();

    // フラッシュカードを取得
    flashcards = await getAllFlashcards(); // IndexedDBから取得
    console.log("All flashcards:", flashcards); // コンソールに表示
  } catch (error) {
    console.error("Error fetching flashcards from IndexedDB:", error);
  }
};

// IndexedDBのフラッシュカードを更新する処理
const updateFlashcardsInIndexedDB = async () => {
  try {
    // 取得したフラッシュカードの次回学習日を適当な日付に設定
    const updatedFlashcards = flashcards.map(card => {
      // nextStudyDateを適当な日付に変更（例えば、未来の無効な日付）
      card.nextStudyDate = '9999-12-31T00:00:00Z'; // ここで無効な日付を設定
      return card;
    });

    // 更新後のフラッシュカードをindexedDBに保存
    for (const card of updatedFlashcards) {
      await updateFlashcardInDB(card); // indexedDB内で更新
    }

    console.log('Flashcards updated in IndexedDB:', updatedFlashcards);
  } catch (error) {
    console.error('Error updating flashcards in IndexedDB:', error);
  }
};

// APIサーバーでの更新処理
const updateFlashcardsInAPI = async () => {
  try {
    // APIサーバーでデータを更新
    const response = await fetch('/api/updateFlashcards', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flashcards: flashcards }), // 必要なデータを送信
    });

    if (!response.ok) {
      throw new Error('Failed to update flashcards in API');
    }

    const data = await response.json();
    console.log('Flashcards updated in API:', data);
  } catch (error) {
    console.error('Error updating flashcards in API:', error);
  }
};

// 初期化処理を行う関数
const initializeData = async () => {
  try {
    await openDatabase();  // 1回だけデータベースを開く
    await fetchFlashcards();  // IndexedDBからフラッシュカードデータを取得
  } catch (error) {
    console.error("Error during initialization:", error);
  }
};

// DOMの読み込み後に実行
document.addEventListener("DOMContentLoaded", async () => {
  await initializeData(); // 初期化処理

  const urlParams = new URLSearchParams(window.location.search);
  dateParam = urlParams.get('date');

  // 解答を表示させる処理
  try {
    console.log("Fetched Flashcards:", flashcards); // 取得したフラッシュカードを表示

    // nextStudyDateが一致するフラッシュカードをフィルタリング
    const matchingCards = flashcards.filter(card => {
      if (card.nextStudyDate) {
        const cardDate = card.nextStudyDate.split('T')[0];
        return cardDate === dateParam.replace(/\//g, '-');
      }
      return false;
    });

    console.log("Matching Flashcards:", matchingCards); // 一致するフラッシュカードを表示

    const quizDisplay = document.getElementById('mainQuiz');
    if (matchingCards.length > 0 && matchingCards[0].question) {
      quizDisplay.value = matchingCards[0].question; // 最初のフラッシュカードの質問を表示
    } else {
      alert("本日の学習分は終了です　問題一覧に遷移します");
      window.location.href = "index.html"; // 一覧ページに遷移
      console.error('No matching flashcards available for the selected date or missing question property');
    }
  } catch (error) {
    console.error('Error fetching flashcards:', error);
  }

  // 『解答する』ボタンの処理
  const letgoButton = document.getElementById('letgo');
  if (letgoButton) {
    letgoButton.onclick = async () => {
      if (dateParam) {
        // IndexedDB内で更新を行う
        await updateFlashcardsInIndexedDB();  // IndexedDB内で更新

        // APIサーバーに対して非同期で更新リクエストを送信
        updateFlashcardsInAPI();  // ここではawaitしないのでバックグラウンドで送信

        // 次のページに遷移
        window.location.href = `answer.html?date=${encodeURIComponent(dateParam)}`; // 日付を渡して遷移
      } else {
        console.error('Date parameter not found.');
      }
    };
  } else {
    console.error("Element with ID 'letgo' not found");
  }

  // 『問題一覧へ』ボタンの処理
  const listButton = document.getElementById("list");
  if (listButton) {
    listButton.onclick = () => {
      window.location.href = "index.html"; // 一覧ページに遷移
    };
  } else {
    console.error("Element with ID 'list' not found");
  }
});
