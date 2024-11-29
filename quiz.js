'use strict'; // エラーあれば表示、必ず先頭

let dateParam = "";  // グローバルに宣言
let flashcards = [];

const apiUrl = "https://my-flashcard-52952319bda7.herokuapp.com/api/flashcards";

// APIからフラッシュカードを取得する関数
async function fetchFlashcards() {
  try {
    // APIサーバーからデータを取得
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // レスポンスからJSONデータを取得
    flashcards = await response.json();
    console.log("Fetched Flashcards:", flashcards);
  } catch (error) {
    console.error("Error fetching flashcards from API:", error);
  }
}

// DOMの読み込み後に実行
document.addEventListener("DOMContentLoaded", async () => {
  // APIからフラッシュカードを取得
  await fetchFlashcards();  // 取得が完了してから次の処理を行う

  const urlParams = new URLSearchParams(window.location.search);
  dateParam = urlParams.get('date');

  // dateParamが有効かどうか確認
  if (!dateParam) {
    console.error("No date parameter provided.");
    return;
  }

  // 解答を表示させる処理
  try {
    console.log("Fetched Flashcards:", flashcards); // 取得したフラッシュカードを表示

    // nextStudyDateが一致するフラッシュカードをフィルタリング
    const matchingCards = flashcards.filter(card => {
      if (card.nextStudyDate) {
        const cardDate = card.nextStudyDate.split('T')[0]; // nextStudyDateがあれば日付部分を抽出
        return cardDate === dateParam.replace(/\//g, '-');  // dateParamに一致するかチェック
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
    console.error('Error processing flashcards:', error);
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
