// サーバーサイド フレームワークexpressを使用
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const https = require('https'); // HTTPS通信が必要であれば復活

// const fs = require('fs'); // SSL証明書を使用する場合復活

const app = express();
const PORT = process.env.PORT || 3000;  // Heroku環境ではポートを環境変数から取得

app.get('/favicon.ico', (req, res) => res.status(204).end());

const cors = require('cors');
const allowedOrigins = ['https://kolonelver1.github.io'];  // 許可するオリジン

app.use(cors({
  origin: (origin, callback) => {
    // リクエスト元のオリジンが許可されているかをチェック
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);  // 許可されたオリジンの場合
    } else {
      const errorMessage = `CORS error: Origin ${origin} is not allowed`;
      console.error(errorMessage);  // サーバーログにエラーを出力
      callback(new Error(errorMessage));  // 許可されていないオリジンの場合、エラーを返す
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],   // 許可するメソッド
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],  // 許可するヘッダー
  credentials: true,  // 認証情報（クッキーなど）を許可
}));

// エラーハンドリングミドルウェア
app.use((err, req, res, next) => {
  if (err) {
    console.error('CORS Error:', err.message);
    res.status(403).json({
      error: 'Forbidden',
      message: err.message,
    });
  } else {
    next();
  }
});

app.use(bodyParser.json());  // JSONデータをパースするミドルウェア

// サーバータイムアウト設定を60秒に
app.set('timeout', 60000); // 60秒

// MongoDB接続
const connectToDatabase = async () => {
  const dbURI = process.env.MONGODB_URI || 'your_default_mongodb_uri'; // デフォルトのURIを設定

  try {
    await mongoose.connect(dbURI);
    console.log('Connected to MongoDB Atlas');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1); // MongoDBへの接続失敗時にプロセスを終了
  }
};

connectToDatabase(); // MongoDBに接続

// エンドポイント
app.get('/', (req, res) => {
  res.status(200).send('API is running'); // APIが稼働中であることを明示的に返す
});


// スキーマの定義
const flashcardSchema = new mongoose.Schema({
  question: { type: String, required: true }, // 必須フィールド
  answer: { type: String, required: true },   // 必須フィールド
  level: {
    type: Number,
    required: true,
  },
  nextStudyDate: { type: Date, default: Date.now, required: false } // デフォルト値を設定
});


// 上部スキーマのデータ構造を持つMongooseのモデルを作成
const Flashcard = mongoose.model('Flashcard', flashcardSchema);

// スクロールの読み込み処理
app.get('/questions', async (req, res) => {
  //questionsに対するリクエストを受け付け、非同期関数でデータを取得・処理
  const page = parseInt(req.query.page) || 1;//受け取ったページ番号読み込み.デフォ１
  const limit = parseInt(req.query.limit) || 10;//ページあたりのデータ数読み込みデフォ10
  const skip = (page - 1) * limit;//データを取得する際に、どこから取得を始めるかを指定

  try {
    const questions = await Flashcard.find().skip(skip).limit(limit);
    //表示データをquestionsに収納
    res.status(200).send(questions);//ステータスコード200を設定、questionsを送る
  } catch (err) { //エラーハンドリング
    console.error('Error fetching questions:', err);
    res.status(500).send({ error: 'データの取得に失敗しました' });//ステータスコード500を設定、エラーを送る
  }
});

// フラッシュカードの一覧を取得するエンドポイント
app.get('/api/flashcards', async (req, res) => {
  try {
    const flashcards = await Flashcard.find();
    res.json(flashcards);
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    res.status(500).json({ message: 'Error fetching flashcards' });
  }
});

// セレクトボックスの日付取得
app.post('/api/getQuiz', (req, res) => {
  console.log("Request received at /api/getQuiz");
  const { nextStudyDate } = req.body;
  console.log("Received nextStudyDate:", nextStudyDate); // デバッグ用にログを出力

  // 受け取った日付をDate型に変換
  const date = new Date(nextStudyDate);
  if (isNaN(date)) {
    return res.status(400).json({ message: "Invalid date format." });
  }

  // 日付の範囲を指定してデータを取得
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));

  Flashcard.find({
    nextStudyDate: {
      $gte: startOfDay,
      $lt: endOfDay
    }
  })
    .then(flashcards => {
      console.log("Flashcards found:", flashcards); // デバッグ用
      if (flashcards.length > 0) {
        res.status(200).json(flashcards);
      } else {
        res.status(404).json({ message: "No flashcards found for the specified date." });
      }
    })
    .catch(error => {
      console.error("Error fetching flashcards:", error);
      res.status(500).json({ message: "Server error." });
    });
});


// フラッシュカードの追加
app.post('/api/flashcards', async (req, res) => {//非同期でデータを取得
  const { question, answer, level, nextStudyDate } = req.body;//フィールド要素を定義

  if (!question || !answer) {//questionまたはanswerが存在しない
    return res.status(400).json({ error: 'Question and answer are required.' });
    //ステータスコード400を定義して、エラーを送る
  }

  const newFlashcard = new Flashcard({ question, answer, level, nextStudyDate });
  //mongoseモデルから、新たにnewFlashcardを定義

  try {
    await newFlashcard.save();//newFlashcardを保存
    res.status(201).json({ message: 'Flashcard added successfully!' });
    //新しいリソースが正常に作成されたことを示す
  } catch (error) {
    console.error('Error adding flashcard:', error);
    res.status(500).json({ error: 'Database error: ' + error.message });
    //サーバー内部のエラーを示し、リクエストを処理できない
  }
});

// 次回学習日を計算する関数
const updateNextStudyDate = (level) => {
  const today = new Date();
  let daysToAdd;

  switch (level) {
    case 0: return null;
    case 1: daysToAdd = 1; break;
    case 2: daysToAdd = 2; break;
    case 3: daysToAdd = 3; break;
    case 4: daysToAdd = 5; break;
    case 5: daysToAdd = 8; break;
    case 6: daysToAdd = 13; break;
    case 7: daysToAdd = 24; break;
    case 8: daysToAdd = 37; break;
    case 9: daysToAdd = 61; break;
    case 10: daysToAdd = 98; break;
    case 11: daysToAdd = 130; break;
    case 12: daysToAdd = 150; break;
    case 13: daysToAdd = 180; break;
    case 14: daysToAdd = 200; break;
    case 15: daysToAdd = 220; break;
    case 16: daysToAdd = 250; break;
    case 17: daysToAdd = 280; break;
    case 18: daysToAdd = 300; break;
    case 19: daysToAdd = 330; break;
    case 20: daysToAdd = 350; break;
    default: daysToAdd = 0; // デフォルトは0日
  }

  return new Date(today.setDate(today.getDate() + daysToAdd));
};

// フラッシュカードのレベルと次回学習日の更新エンドポイント
app.put('/api/flashcards/:id', async (req, res) => {
  console.log('PUT request received for cardId:', req.params.id);  // リクエスト受信時のログ
  const { id } = req.params;
  const { difficulty } = req.body;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  try {
    const flashcard = await Flashcard.findById(id);
    if (!flashcard) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }

    // レベルの計算
    switch (difficulty) {
      case 'rmake':
        flashcard.level = 0;
        flashcard.nextStudyDate = null;  // 次回学習日をnullに設定
        break;
      case 'easy':
        flashcard.level += 3;
        break;
      case 'normal':
        flashcard.level += 2;
        break;
      case 'hard':
        flashcard.level += 1;
        break;
      case 'unknown':
        flashcard.level = 1;
        break;
      default:
        return res.status(400).json({ message: 'Invalid difficulty' });
    }

    // レベルに基づいて次回学習日を更新
    if (flashcard.level !== 0) {
      flashcard.nextStudyDate = updateNextStudyDate(flashcard.level);
    } else {
      flashcard.nextStudyDate = null;
    }

    // 更新後のフラッシュカードを保存
    try {
      const updatedFlashcard = await flashcard.save();
      res.status(200).json(updatedFlashcard);
    } catch (saveError) {
      console.error('Error saving flashcard:', saveError);
      res.status(500).json({ error: 'Error saving flashcard' });
    }

  } catch (error) {
    console.error('Error updating flashcard level:', error);
    res.status(500).send('Internal Server Error');
  }
});

// 削除の処理
app.post('/delete', async (req, res) => { //指定パスからデータ取得
  console.log("リクエストボディ:", req.body);//取得時点のデータをコンソールに表示

  try {
    const itemsToDelete = req.body.items.map(id => new mongoose.Types.ObjectId(id));
    //削除したいアイテムのIDを新しいIDに変換し、itemsToDeleteに収納

    const result = await Flashcard.deleteMany({ _id: { $in: itemsToDelete } });
    //itemsToDelete(IDが収納されている)のドキュメントを削除
    res.json({ success: true, deletedCount: result.deletedCount });
    //削除が成功したことを示す,削除されたドキュメントの数
  } catch (error) {
    console.error("削除エラー:", error);
    res.status(500).json({ success: false, error: error.message });
    //削除が失敗したことを示す
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

