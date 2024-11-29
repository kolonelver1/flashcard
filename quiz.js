'use strict'; // エラーあれば表示、必ず先頭

let flashcards = [];

// indexedDB.jsから必要な関数をインポート
import { openDatabase, getAllFlashcards } from './indexedDB.js';

// IndexedDBから最新データを取得する関数
const fetchFlashcards = async () => {
  try {
    await openDatabase(); // IndexedDBを開く

    flashcards = await getAllFlashcards(); // 全てのフラッシュカードを取得
    console.log("Fetched flashcards:", flashcards); // デバッグ用ログ
  } catch (error) {
    console.error("Error fetching flashcards from IndexedDB:", error);
  }
};

// 指定された日付に一致するフラッシュカードをフィルタリング
const getMatchingCards = (dateParam) => {
  if (!dateParam) {
    console.error('Date parameter is missing or invalid');
    return [];
  }

  const matchingCards = flashcards.filter(card => {
    if (card.nextStudyDate) {
      const cardDate = card.nextStudyDate.split('T')[0];
      return cardDate === dateParam.replace(/\//g, '-');
    }
    return false;
  });

  console.log("Matching flashcards:", matchingCards);
  return matchingCards;
};

// 初期化処理
const initializeData = async () => {
  try {
    await fetchFlashcards(); // IndexedDBから最新データを取得
  } catch (error) {
    console.error("Error during initialization:", error);
  }
};

// DOMの読み込み後に実行
document.addEventListener("DOMContentLoaded", async () => {
  await initializeData(); // 初期化処理

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
