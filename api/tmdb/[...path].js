const axios = require('axios');

// Vercel Serverless Functionのハンドラー
module.exports = async (req, res) => {
  // 環境変数の検証
  const TMDB_API_KEY = process.env.TMDB_API_KEY;

  if (!TMDB_API_KEY) {
    console.error('ERROR: TMDB_API_KEY is not configured');
    return res.status(500).json({
      error: 'Configuration Error',
      message: 'TMDB API key is not configured'
    });
  }

  // CORS設定
  const origin = req.headers.origin;
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [];

  // 本番環境では vercel.app ドメインと カスタムドメインを許可
  const isVercelDomain = origin && origin.includes('.vercel.app');
  const isAllowedOrigin = allowedOrigins.length === 0 || allowedOrigins.includes(origin);

  if (origin && (isVercelDomain || isAllowedOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONSリクエスト（プリフライト）の処理
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GETメソッドのみ許可
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method Not Allowed',
      message: 'Only GET requests are allowed'
    });
  }

  try {
    // パスパラメータからTMDB APIのエンドポイントを取得
    // /api/tmdb/genre/movie/list → genre/movie/list
    const path = req.query.path;
    const tmdbEndpoint = Array.isArray(path) ? path.join('/') : path;

    if (!tmdbEndpoint) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'TMDB API endpoint is required'
      });
    }

    // クエリパラメータを取得してAPIキーを追加
    const { path: _, ...queryParams } = req.query;
    const params = {
      ...queryParams,
      api_key: TMDB_API_KEY
    };

    // TMDB APIにリクエスト
    const tmdbUrl = `https://api.themoviedb.org/3/${tmdbEndpoint}`;

    console.log(`[PROXY] ${req.method} ${tmdbUrl}`);

    const response = await axios.get(tmdbUrl, {
      params,
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
};
