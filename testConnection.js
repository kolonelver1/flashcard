// mongodbパッケージをインポート
const { MongoClient } = require('mongodb');

// MongoDB Atlasの接続文字列
const uri = "mongodb+srv://kogepurin:ZzsBoSa9fEJPSBot@flashcardserver.uhvbw.mongodb.net/?retryWrites=true&w=majority&appName=FlashcardServer";

// MongoClientのインスタンス作成
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// 接続テスト用の非同期関数
async function connectTest() {
  try {
    // MongoDBへの接続を試みる
    await client.connect();
    console.log("接続成功！MongoDB Atlasに正常に接続しました。");

    // 必要に応じて、接続したデータベースに簡単な操作を行ってみる
    const db = client.db(); // デフォルトのデータベースを取得
    const collections = await db.collections(); // データベース内のコレクション一覧を取得
    console.log("データベース内のコレクション:", collections.map(col => col.collectionName));

  } catch (error) {
    // 接続に失敗した場合はエラーメッセージを表示
    console.error("接続エラー:", error.message);
  } finally {
    // 接続を閉じる
    await client.close();
  }
}

// 接続テストを実行
connectTest();

