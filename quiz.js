'use strict'; // エラーあれば表示、必ず先頭

let flashcards = [];
// add.js の最初に indexedDB.js から openDatabase をインポート
import { openDatabase, getAllFlashcards, deleteFlashcardsFromIndexedDB, saveFlashcard } from './indexedDB.js';

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

  // フラッシュカードを取得して表示する処理
  try {
  //   const apiUrl = 'https://my-flashcard-52952319bda7.herokuapp.com/api/flashcards';

  //   const response = await fetch(apiUrl, {
  //     // 自己署名証明書のエラーを無視する場合、以下のオプションを追加することも可能
  //     // credentials: 'same-origin',  // Cookieなどを必要とする場合
  //     headers: {
  //       'Content-Type': 'application/json',
  //       // 必要ならばAuthorizationヘッダーを追加
  //     },
  //   });

  //   if (!response.ok) {
  //     throw new Error(`HTTP error! status: ${response.status}`);
  //   }


  //   flashcards = await response.json();
  //   console.log("Fetched Flashcards:", flashcards); // 取得したフラッシュカードを表示

    // dateParamがnullまたは空の場合、処理を中断
    if (!dateParam) {
      console.error('Date parameter is missing or invalid');
      return;
    }

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

    // 問題表示エリアのIDを取得
    const quizDisplay = document.getElementById('mainQuiz');

    // データが存在するかを確認して表示
    if (matchingCards.length > 0 && matchingCards[0].question) {
      quizDisplay.value = matchingCards[0].question; // 取得した問題を表示
    } else {
      alert("本日の学習分は終了です　問題一覧に遷移します");
      // 問題一覧ページに遷移（例: index.html）
      window.location.href = "index.html";
      console.error('No matching flashcards available for the selected date or missing question property');
      quizDisplay.value = 'No matching flashcards available for the selected date'; // エラーメッセージを表示
    }
  } catch (error) {
    console.error('Error fetching flashcards:', error);
  }

  //『解答する』ボタンの処理
  const letgoButton = document.getElementById('letgo');
  if (letgoButton) {
    letgoButton.onclick = function () {
      const urlParams = new URLSearchParams(window.location.search);
      const dateParam = urlParams.get('date'); // クエリから`date`を取得

      console.log("Current URL parameters:", window.location.search); // URLパラメータを確認

      if (dateParam) {
        window.location.href = `answer.html?date=${encodeURIComponent(dateParam)}`; // `date`をanswer.htmlに渡す
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
    listButton.onclick = function () {
      window.location.href = "index.html"; // 遷移先のURLを指定
    };
  } else {
    console.error("Element with ID 'list' not found");
  };

});