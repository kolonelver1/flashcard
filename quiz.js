'use strict'; // エラーあれば表示、必ず先頭

let flashcards = [];
// add.js の最初に indexedDB.js から openDatabase をインポート
import { openDatabase, getAllFlashcards} from './indexedDB.js';

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

// 初期化処理を行う関数
const initializeData = async () => {
  try {
    await openDatabase();  // 1回だけデータベースを開く
    await fetchFlashcards();  // IndexedDBからフラッシュカードデータを取得
  } catch (error) {
    console.error("Error during initialization:", error);
  }
};

// 初期化
initializeData();

//HTMLが読み込まれてから実行
document.addEventListener("DOMContentLoaded", async () => {

  await initializeData();

  const urlParams = new URLSearchParams(window.location.search);
  const dateParam = urlParams.get('date');

  // フラッシュカードをフィルタリング
  const matchingCards = getMatchingCards(dateParam);

  // 問題表示エリア
  const quizDisplay = document.getElementById('mainQuiz');
  if (matchingCards.length > 0 && matchingCards[0].question) {
    quizDisplay.value = matchingCards[0].question; // 最初のフラッシュカードの質問を表示
  } else {
    alert("本日の学習分は終了です　問題一覧に遷移します");
    window.location.href = "index.html"; // 一覧ページに遷移
    console.error('No matching flashcards available for the selected date or missing question property');
  }

  // 『解答する』ボタンの処理
  const letgoButton = document.getElementById('letgo');
  if (letgoButton) {
    letgoButton.onclick = () => {
      if (dateParam) {
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
