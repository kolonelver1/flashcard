'use strict'; // エラーがあれば表示、必ず先頭

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

// HTMLが読み込まれてから実行
// document.addEventListener('DOMContentLoaded', async () => {
//   try {
//     const apiUrl = 'https://my-flashcard-52952319bda7.herokuapp.com/api/flashcards';

//     const response = await fetch(apiUrl, {
//       headers: {
//         'Content-Type': 'application/json',
// 必要ならばAuthorizationヘッダーを追加
//     },
//   });

//   if (!response.ok) {
//     throw new Error(`HTTP error! status: ${response.status}`);
//   }

//   flashcards = await response.json();
//   console.log(flashcards); // コンソールで取得したデータを確認
// } catch (error) {
//   console.error('Error fetching questions:', error);
// }

// 日付問題を取得する関数loadQuestionsの定義
async function loadQuestions() {
  const deleteForm = document.getElementById('deleteForm');
  deleteForm.innerHTML = ''; // 重複防止のためフォーム内の内容をクリア

  if (flashcards.length === 0) {
    deleteForm.innerHTML = '<p>問題を取得してください。</p>';
    return;
  }

  const selectedDate = document.getElementById('getQuizDate').value;

  // セレクトボックスで選択された日付に一致するカードをフィルタリング
  const matchingCards = flashcards.filter(card => {
    if (card.nextStudyDate) {
      const cardDate = card.nextStudyDate.split('T')[0]; // 日付部分だけを抽出
      return cardDate === selectedDate.replace(/\//g, '-'); // セレクトボックスの日付と一致するものをフィルタリング
    }
    return false;
  });

  if (matchingCards.length === 0) {
    deleteForm.innerHTML = '<p>指定された日付に一致する問題がありません。</p>';
    return;
  }

  // チェックボックスと問題を追加
  matchingCards.forEach((card, index) => {
    const quizContainer = document.createElement('div');
    quizContainer.classList.add('quiz-container'); // スタイル用にクラスを追加
    const answerContainer = document.createElement('div');
    answerContainer.classList.add('answer-container'); // スタイル用にクラスを追加

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = 'item';
    checkbox.value = card._id;
    checkbox.id = `question_${index}`;

    const label = document.createElement('label');
    label.textContent = card.question;
    label.classList.add('question-label');
    label.htmlFor = checkbox.id;

    const answerLabel = document.createElement('label');
    answerLabel.textContent = card.answer;
    answerLabel.classList.add('answer-label');
    answerLabel.htmlFor = checkbox.id;

    // コンテナに要素を追加
    quizContainer.appendChild(checkbox);
    quizContainer.appendChild(label);

    answerContainer.appendChild(answerLabel);

    // deleteFormにコンテナを追加
    deleteForm.appendChild(quizContainer);
    deleteForm.appendChild(answerContainer);
  });
};

// Levelから問題を取得する関数loadLevelの定義
async function loadLevel() {
  const deleteForm = document.getElementById('deleteForm');
  deleteForm.innerHTML = ''; // 重複防止のためフォーム内の内容をクリア

  if (!flashcards || flashcards.length === 0) {
    deleteForm.innerHTML = '<p>問題を取得してください。</p>';
    return;
  }

  const selectedLevel = parseInt(document.getElementById('getQuizLevel').value, 10);
  const matchingCards = flashcards.filter(card => card.level === selectedLevel);
  // レベルでフィルタリング

  if (matchingCards.length === 0) {
    deleteForm.innerHTML = '<p>指定されたLevelに一致する問題がありません。</p>';
    return;
  }

  // チェックボックスと問題を追加
  matchingCards.forEach((card, index) => {
    const quizContainer = document.createElement('div');
    quizContainer.classList.add('quiz-container'); // スタイル用にクラスを追加
    const answerContainer = document.createElement('div');
    answerContainer.classList.add('answer-container'); // スタイル用にクラスを追加

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = 'item';
    checkbox.value = card._id;
    checkbox.id = `question_${index}`;

    const label = document.createElement('label');
    label.textContent = card.question;
    label.classList.add('question-label');
    label.htmlFor = checkbox.id;

    const answerLabel = document.createElement('label');
    answerLabel.textContent = card.answer;
    answerLabel.classList.add('answer-label');
    answerLabel.htmlFor = checkbox.id;

    // コンテナに要素を追加
    quizContainer.appendChild(checkbox);
    quizContainer.appendChild(label);

    answerContainer.appendChild(answerLabel);

    // deleteFormにコンテナを追加
    deleteForm.appendChild(quizContainer);
    deleteForm.appendChild(answerContainer);
  });
}

// getQuizボタンで問題を問題取得
document.getElementById('getQuiz').addEventListener('click', function (event) {
  event.preventDefault();  // デフォルトの動作を防ぐ
  loadQuestions();  // ボタンがクリックされた時に関数を実行
});

// getSelectLevelボタンで問題を問題取得
document.getElementById('getSelectLevel').addEventListener('click', function (event) {
  event.preventDefault();  // デフォルトの動作を防ぐ
  loadLevel();  // ボタンがクリックされた時に関数を実行
});

// 日付フォーマット関数 (yyyy/mm/dd)
function formatDate(dateString) {
  const date = new Date(dateString);
  if (isNaN(date)) return null; // 無効な日付の場合はnullを返す

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

// 日付用セレクトボックス
// IndexedDBからフラッシュカードデータを取得する関数
async function getAllFlashcards() {
  return new Promise((resolve, reject) => {
    const dbRequest = indexedDB.open('flashcardDB', 1);

    dbRequest.onerror = (event) => {
      console.error('IndexedDB オープンエラー:', event.target.error);
      reject(event.target.error);
    };

    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction('flashcards', 'readonly');
      const store = transaction.objectStore('flashcards');
      const getRequest = store.getAll(); // 全データを取得

      getRequest.onsuccess = () => {
        resolve(getRequest.result);
      };

      getRequest.onerror = (event) => {
        reject(event.target.error);
      };
    };

    dbRequest.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('flashcards')) {
        db.createObjectStore('flashcards', { keyPath: '_id' });
      }
    };
  });
}

// 指定されたセレクトボックスをユニークな日付で更新する関数
async function populateStudyDates(selectBoxId) {
  try {
    // IndexedDBから全フラッシュカードデータを取得
    const flashcards = await getAllFlashcards();

    const uniqueDates = new Set(); // ユニークな日付を格納するためのSetを作成

    flashcards.forEach(card => {
      if (card.nextStudyDate) {
        const formattedDate = formatDate(card.nextStudyDate);
        if (formattedDate) { // フォーマットが成功した場合のみ追加
          uniqueDates.add(formattedDate); // Setに日付を追加（重複は自動的に排除される）
        }
      }
    });

    // ユニークな日付をArrayに変換し、昇順にソート
    const sortedUniqueDates = Array.from(uniqueDates).sort((a, b) => a.localeCompare(b));

    // 指定されたセレクトボックスの要素を取得
    const selectBox = document.getElementById(selectBoxId);
    selectBox.innerHTML = ''; // セレクトボックスをクリア

    // ユニークな日付をセレクトボックスに追加
    sortedUniqueDates.forEach(date => {
      const option = document.createElement('option');
      option.value = date;
      option.textContent = date;
      selectBox.appendChild(option); // セレクトボックスにオプションを追加
    });

    // 変更を反映
    selectBox.dispatchEvent(new Event('change')); // セレクトボックスの変更を通知

  } catch (error) {
    console.error('Error populating study dates:', error);
  }
}

//Level用セレクトボックス
// IndexedDBからフラッシュカードデータを取得する関数
async function getAllFlashcards() {
  return new Promise((resolve, reject) => {
    const dbRequest = indexedDB.open('flashcardDB', 1);

    dbRequest.onerror = (event) => {
      console.error('IndexedDB オープンエラー:', event.target.error);
      reject(event.target.error);
    };

    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction('flashcards', 'readonly');
      const store = transaction.objectStore('flashcards');
      const getRequest = store.getAll(); // 全データを取得

      getRequest.onsuccess = () => {
        resolve(getRequest.result);
      };

      getRequest.onerror = (event) => {
        reject(event.target.error);
      };
    };

    dbRequest.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('flashcards')) {
        db.createObjectStore('flashcards', { keyPath: '_id' });
      }
    };
  });
}

// 指定されたセレクトボックスをユニークなレベルで更新する関数
async function populateStudyLevel(selectBoxId) {
  try {
    // IndexedDBから全フラッシュカードデータを取得
    const flashcards = await getAllFlashcards();

    // 全てのカードのLevelを配列に格納し、重複を排除して昇順にソート
    const levels = [...new Set(flashcards.map(card => card.level))].sort((a, b) => a - b);

    // 指定されたセレクトボックスの要素を取得
    const selectBox = document.getElementById(selectBoxId);
    selectBox.innerHTML = ''; // セレクトボックスをクリア

    // Levelをセレクトボックスに追加
    levels.forEach(level => {
      const option = document.createElement('option');
      option.value = level;
      option.textContent = `Level ${level}`;
      selectBox.appendChild(option); // セレクトボックスにオプションを追加
    });

    // 変更を反映
    selectBox.dispatchEvent(new Event('change')); // セレクトボックスの変更を通知

  } catch (error) {
    console.error('Error populating study levels:', error);
  }
}

// 『問題を解く』ボタンの処理
document.getElementById('quiz').onclick = function () {
  // セレクトボックスで選択した日付の値をURLパラメータとして渡す
  const selectedDate = document.getElementById('studyDatesSelect').value;
  if (selectedDate) {
    window.location.href = `quiz.html?date=${selectedDate}`;
  } else {
    console.error('Please select a date before proceeding.');
  }
};

// 『add』ボタンの処理
const addButton = document.getElementById('save');
if (addButton) {
  addButton.addEventListener('click', async (event) => {
    event.preventDefault(); // フォームの送信を防ぐ

    // 入力フィールドの取得
    const text = document.getElementById('quiz-text');
    const answerText = document.getElementById('answer-text');

    const today = new Date().toISOString(); // ISO形式で日付を取得
    const Level = "1"; // レベル

    const newFlashcard = {
      question: text.value,
      answer: answerText.value,
      level: Level,
      nextStudyDate: today,
    };
    
    try {
      // サーバーに新しいデータを追加
      const response = await fetch('https://my-flashcard-52952319bda7.herokuapp.com/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFlashcard),
      });
    
      if (!response.ok) throw new Error('Network response was not ok');
    
      // サーバーから返ってきたデータを取得
      const savedData = await response.json();
      console.log('Success:', savedData);
    
      // サーバーから取得したデータに_idがない場合、Date.now()で生成
      const newFlashcardForIndexedDB = {
        ...savedData,
        _id: savedData._id || Date.now(), // _idをサーバーから取得できない場合、ローカルで生成
      };
    
      // サーバーから取得したデータをIndexedDBに保存
      await saveFlashcard(newFlashcardForIndexedDB);
    
      // データ保存成功時のフィードバックやUI更新
      console.log('Flashcard successfully added to IndexedDB:', newFlashcardForIndexedDB);
      populateStudyDates('studyDatesSelect'); // セレクトボックスを更新
      populateStudyDates('getQuizDate'); 
      populateStudyLevel('getQuizLevel');
    } catch (error) {
      console.error('Error adding flashcard:', error);
    }

    // テキストボックスをクリア
    text.value = '';
    answerText.value = '';
  });
} else {
  console.error("Element with ID 'save' not found");
}

// 問題削除の処理
window.deleteSelected = function () {
  const form = document.getElementById("deleteForm");
  const formData = new FormData(form);

  // 選択されたチェックボックスの値を取得
  const itemsToDelete = [];
  formData.forEach((value, key) => {
    if (key === "item") {
      itemsToDelete.push(value);
    }
  });

  console.log("削除対象のアイテム:", itemsToDelete); // 配列を確認

  if (itemsToDelete.length === 0) {
    console.warn("削除するアイテムが選択されていません");
    return;
  }

  // サーバーにデータを送信して削除
  fetch('https://my-flashcard-52952319bda7.herokuapp.com/delete', { // ポートをサーバー側と一致させる
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ items: itemsToDelete })
  })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(async data => {
      console.log("サーバー削除成功:", data);

      // IndexedDBから該当アイテムを削除
      try {
        await openDatabase(); // IndexedDBを開く
        await deleteFlashcardsFromIndexedDB(itemsToDelete);
        console.log("IndexedDB削除成功");
      } catch (error) {
        console.error("IndexedDB削除エラー:", error);
      }

      location.reload(); // ページをリロード
    })
    .catch(error => console.error("削除エラー:", error));
};

window.checkedQuestions = function () {
  const form = document.getElementById("deleteForm");
  const formData = new FormData(form);

  // 選択されたチェックボックスの値を取得
  const checkedItems = [];
  formData.forEach((value, key) => {
    if (key === "item") {
      checkedItems.push(value);
    }
  });

  console.log("取得対象のアイテム:", checkedItems);

  if (checkedItems.length === 0) {
    console.warn("取得するアイテムが選択されていません");
    return;
  }

  // textarea 要素を取得
  const quizTextArea = document.getElementById("quiz-text");
  const answerTextArea = document.getElementById("answer-text");

  // APIリクエストを使って選択された問題の詳細を取得
  fetch('https://my-flashcard-52952319bda7.herokuapp.com/api/flashcards/checked', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items: checkedItems }),
  })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(data => {
      // APIから取得したデータを使って問題と回答を転記
      let selectedQuestions = [];
      let selectedAnswers = [];

      // 取得したデータを問題文と回答に分けて配列に格納
      data.forEach(item => {
        selectedQuestions.push(item.question);
        selectedAnswers.push(item.answer);
      });

      // 問題と回答をtextareaにセット
      quizTextArea.value = selectedQuestions.join("\n");
      answerTextArea.value = selectedAnswers.join("\n");

      console.log("表示された問題:", selectedQuestions);
      console.log("表示された回答:", selectedAnswers);
    })
    .catch(error => {
      console.error("エラーが発生しました:", error);
    });
};
