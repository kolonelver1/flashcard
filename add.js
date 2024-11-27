'use strict'; // エラーがあれば表示、必ず先頭

import { openDatabase, getAllFlashcards } from './indexedDB.js'; // IndexedDB.js をインポート

let flashcards = []; // グローバルに宣言

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await openDatabase();
    flashcards = await getAllFlashcards();
    console.log(flashcards); // コンソールで取得したデータを確認
  } catch (error) {
    console.error('IndexedDBのデータ取得エラー:', error);
  }

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
  async function populateStudyDates(selectBoxId) {
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
  }

  //Level用セレクトボックス
  async function populateStudyLevel(selectBoxId) {

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
  }

  // 各セレクトボックスのIDを指定して関数を呼び出し
  populateStudyDates('studyDatesSelect');
  populateStudyDates('getQuizDate');
  populateStudyLevel('getQuizLevel');

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
  const addButton = document.getElementById('save'); // 『add』ボタンの設定
  if (addButton) {
    // 保存ボタンが押された時の処理
    addButton.addEventListener('click', (event) => {
      event.preventDefault(); // フォームの送信を防ぐ

      // 入力フィールドの取得
      const text = document.getElementById('quiz-text'); // 入力された新しい問題
      const answerText = document.getElementById('answer-text'); // 入力された新しい答え

      const today = new Date().toISOString(); // ISO形式で日付を取得
      const Level = "1"; // レベル

      const newFlashcard = {
        question: text.value, // ユーザーが入力した問題
        answer: answerText.value, // ユーザーが入力した答え
        level: Level, // 固定のレベル
        nextStudyDate: today // ISO形式で今日の日付
      };

      // サーバーに新しいフラッシュカードを追加するリクエスト
      fetch('https://my-flashcard-52952319bda7.herokuapp.com/api/flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newFlashcard),
        mode: 'cors',  // CORSを有効にする
        credentials: 'include',  // クッキーを含める
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          console.log('Success:', data);
          // ここにフラッシュカード追加成功時の処理を書くことができます
        })
        .catch((error) => {
          console.error('Error:', error);
        });

      // テキストボックスをクリア
      text.value = '';
      answerText.value = ''; // 答えもクリア
      location.reload(true);
    });
  } else {
    console.error("Element with ID 'save' not found");
  }

  // 問題削除の処理
  window.deleteSelected = function () {  // グローバルに公開する
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

    // サーバーにデータを送信
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
      .then(data => {
        console.log("削除成功:", data);
        location.reload(); // ページをリロード
      })
      .catch(error => console.error("削除エラー:", error));
  }

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

})
