'use strict'; // エラーあれば表示、必ず先頭

let dateParam = [];  // グローバルに宣言

let flashcards = [];
// add.js の最初に indexedDB.js から openDatabase をインポート
import { openDatabase, getAllFlashcards, updateFlashcardInIndexedDB, deleteFlashcardsFromIndexedDB, saveFlashcard } from './indexedDB.js';

// IndexedDBからフラッシュカードを取得
const fetchFlashcards = async () => {
  try {
    // データベースが開かれていることを確認
    await openDatabase();

    // フラッシュカードを取得
    flashcards = await getAllFlashcards(); // IndexedDBから取得
    console.log("All flashcards:", flashcards); // コンソールに表示

    // ここでセレクトボックスの更新を行う
    populateStudyDates('studyDatesSelect');
    populateStudyDates('getQuizDate');
    populateStudyLevel('getQuizLevel');
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
  //URLパラメータから日付データ取得
  const urlParams = new URLSearchParams(window.location.search);
  dateParam = urlParams.get('date');

  // 解答を表示させる処理
  try {
    // const apiUrl = 'https://my-flashcard-52952319bda7.herokuapp.com/api/flashcards';

    // const response = await fetch(apiUrl, {
    //   // 自己署名証明書のエラーを無視する場合、以下のオプションを追加することも可能
    //   // credentials: 'same-origin',  // Cookieなどを必要とする場合
    //   headers: {
    //     'Content-Type': 'application/json',
    //     // 必要ならばAuthorizationヘッダーを追加
    //   },
    // });

    // if (!response.ok) {
    //   throw new Error(`HTTP error! status: ${response.status}`);
    // }

    // flashcards = await response.json();
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

    // 問題表示エリアのIDを取得
    const answerDisplay = document.getElementById('mainAnswer');

    // データが存在するかを確認して表示
    if (matchingCards.length > 0 && matchingCards[0].answer) {
      answerDisplay.value = matchingCards[0].answer; // 取得した問題を表示
    } else {
      alert("本日の学習分は終了です　問題一覧に遷移します");
      // 問題一覧ページに遷移（例: index.html）
      window.location.href = "index.html";
      console.error('No matching flashcards available for the selected date or missing question property');
      answerDisplay.value = 'No matching flashcards available for the selected date'; // エラーメッセージを表示
    }
  } catch (error) {
    console.error('Error fetching flashcards:', error);
  }

  // レベルを更新する関数
  async function updateLevel(cardId, difficulty) {
    console.log(`Updating level for card ID: ${cardId}`);
    console.log('Difficulty to send:', difficulty);

    // cardIdがMongoDBのObjectId形式かどうかを確認する
    const uuidRegex = /^[0-9a-f]{24}$/i;
    if (!uuidRegex.test(cardId)) {
      console.error('Invalid cardId format');
      return; // 不正なID形式の場合、処理を中止
    }

    try {
      // PUTリクエスト
      const response = await fetch(`https://my-flashcard-52952319bda7.herokuapp.com/api/flashcards/${cardId}`, {
        method: 'PUT',  // データの更新
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ difficulty }),
        mode: 'cors',  // CORSを有効にする
        credentials: 'include',  // クッキーを含める
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 更新後のデータ取得
      const updatedCard = await response.json();
      console.log('Updated Flashcard:', updatedCard);
    } catch (error) {
      console.error('Error updating level:', error);
    }
  }

  // レベル更新用の定義
  const ids = ["remake", "easy", "normal", "hard", "unknown"];
  const difficultyMap = {
    remake: 'rmake',
    easy: 'easy',
    normal: 'normal',
    hard: 'hard',
    unknown: 'unknown',
  };

  // ボタンクリック後の処理（引き数difficulty,cardId取得とページ遷移）,関数の実行
  ids.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('click', async () => {
        const difficulty = difficultyMap[id] || 'unknown'; //idから難易度取得、デフォunknown

        //取得データ0以上なら
        if (flashcards.length > 0) {
          const matchingCards = flashcards.filter(card => {
            // nextStudyDate が null または undefined でないことを確認
            if (card.nextStudyDate) {
              const cardDate = card.nextStudyDate.split('T')[0];
              //URLパラメータから渡されたデータとすべてのnextStudyDateを比較
              return cardDate === dateParam.replace(/\//g, '-');
            }
            return false;  // nextStudyDate が無効な場合、フィルタリングしない
          });

          if (matchingCards.length > 0) {
            const currentCard = matchingCards[0];

            //関数の実行
            await updateLevel(currentCard._id, difficulty);

            const updateFlashcard = async (id, difficulty) => {
              try {
                const response = await fetch(`/api/flashcards/${id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ difficulty }),
                });

                if (!response.ok) throw new Error(`Failed to update flashcard: ${response.status}`);

                const updatedFlashcard = await response.json(); // サーバーからの更新データ
                console.log('Updated flashcard from server:', updatedFlashcard);

                // IndexedDBを更新
                await updateFlashcardInIndexedDB(updatedFlashcard);
              } catch (error) {
                console.error('Error updating flashcard:', error);
              }
            };

            // 使用例（回答後の次回学習日を更新）
            const onAnswerSubmit = async (flashcardId, difficulty) => {
              await updateFlashcard(flashcardId, difficulty);
              console.log('Answer submitted and local data updated');
            };


            // 更新後に問題ページへ遷移
            window.location.href = `quiz.html?date=${encodeURIComponent(dateParam)}`;
          } else {
            console.error('No matching flashcards found for updating level.');
          }
        }
      });
    } else {
      console.error(`Element with ID '${id}' not found`);
    }
  });
});
