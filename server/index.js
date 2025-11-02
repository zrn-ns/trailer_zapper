const path = require('path');
// .envファイルの内容で既存の環境変数を上書き
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), override: true });
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// 環境変数の検証
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const PORT = process.env.PORT || 3000;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:8000', 'http://127.0.0.1:8000'];

if (!TMDB_API_KEY) {
  console.error('ERROR: TMDB_API_KEY is not configured in .env file');
  process.exit(1);
}

// CORSの設定
app.use(cors({
  origin: function (origin, callback) {
    // originがundefinedの場合（同一オリジン）またはALLOWED_ORIGINSに含まれる場合は許可
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// JSONボディパーサー
app.use(express.json());

// ヘルスチェックエンドポイント
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Trailer Zapper Proxy Server is running' });
});

// TMDB APIプロキシエンドポイント
app.get('/api/tmdb/*', async (req, res) => {
  try {
    // パスから /api/tmdb/ を除去してTMDB APIのエンドポイントを取得
    const tmdbEndpoint = req.params[0];

    // クエリパラメータを取得してAPIキーを追加
    const queryParams = {
      ...req.query,
      api_key: TMDB_API_KEY
    };

    // TMDB APIにリクエスト
    const tmdbUrl = `https://api.themoviedb.org/3/${tmdbEndpoint}`;

    console.log(`[PROXY] ${req.method} ${tmdbUrl}`);

    const response = await axios.get(tmdbUrl, {
      params: queryParams,
      timeout: 10000 // 10秒でタイムアウト
    });

    // レスポンスをそのまま返す
    res.status(response.status).json(response.data);

  } catch (error) {
    console.error('[PROXY ERROR]', error.message);

    if (error.response) {
      // TMDB APIからのエラーレスポンス
      res.status(error.response.status).json({
        error: error.response.data,
        message: 'TMDB API error'
      });
    } else if (error.code === 'ECONNABORTED') {
      // タイムアウト
      res.status(504).json({
        error: 'Gateway Timeout',
        message: 'Request to TMDB API timed out'
      });
    } else {
      // その他のサーバーエラー
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch data from TMDB API'
      });
    }
  }
});

// 404エラーハンドラ
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist'
  });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`🚀 Trailer Zapper Proxy Server running on http://localhost:${PORT}`);
  console.log(`📝 Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`);
  console.log(`🔑 TMDB API Key configured: ${TMDB_API_KEY.substring(0, 10)}...`);
});
