'use strict'; // エラーあれば表示、必ず先頭

let dateParam = [];  // グローバルに宣言
let flashcards = [];

// add.js の最初に indexedDB.js から openDatabase をインポート
import { openDatabase, getAllFlashcards } from './indexedDB.js';

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

// 指定された日付に一致するフラッシュカードをフィルタリング
// const getMatchingCards = (dateParam) => {
//   if (!dateParam) {
//     console.error('Date parameter is missing or invalid');
//     return [];
//   }

//   const matchingCards = flashcards.filter(card => {
//     if (card.nextStudyDate) {
//       const cardDate = card.nextStudyDate.split('T')[0];
//       return cardDate === dateParam.replace(/\//g, '-');
//     }
//     return false;
//   });

//   console.log("Matching flashcards:", matchingCards);
//   return matchingCards;
// };

// DOMの読み込み後に実行
document.addEventListener("DOMContentLoaded", async () => {
  await initializeData(); // 初期化処理

  const urlParams = new URLSearchParams(window.location.search);
  dateParam = urlParams.get('date');

  // 問題を表示させる処理
  try {
    console.log("Fetched Flashcards:", flashcards); // 取得したフラッシュカードを表示

    // nextStudyDateが一致するフラッシュカードをフィルタリング
    const matchingCards = flashcards.filter(card => {
      // nextStudyDate が null または undefined でないことを確認
      if (card.nextStudyDate) {
        const cardDate = card.nextStudyDate.split('T')[0];
        return cardDate === dateParam.replace(/\//g, '-');
      }
      return false;  // nextStudyDate が無効な場合、フィルタリングしない
    });

    console.log("Matching Flashcards:", matchingCards); // 一致するフラッシュカードを表示

    // 問題表示エリア
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
