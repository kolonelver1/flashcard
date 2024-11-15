const mongoose = require('mongoose');

// MongoDB Atlasの接続文字列
const dbURI = "mongodb+srv://kogepurin:ZzsBoSa9fEJPSBot@flashcardserver.uhvbw.mongodb.net/";

// MongoDB Atlasに接続
mongoose.connect(dbURI)
  .then(() => {
    console.log('MongoDB Atlasに接続成功');
  })
  .catch((err) => {
    console.error('MongoDB Atlasへの接続失敗:', err);
  });
