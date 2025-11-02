# Trailer Zapper

映画の予告編を次々と視聴できるシネマティックなWebアプリケーションです。TikTokのような没入型体験を提供し、ユーザーは配信サービスやジャンルでフィルタリングした映画の予告編を連続して視聴できます。

## 主な機能

- TMDB APIを使用した映画データの取得
- YouTube IFrame APIによる予告編の再生
- 配信サービス（Netflix、Amazon Prime等）によるフィルタリング
- ジャンル（ホワイトリスト方式）によるフィルタリング
- 興味なし機能（localStorageで永続化）
- 視聴履歴の管理
- フルスクリーン対応
- キーボードショートカット対応

## セットアップ

### 前提条件

- Node.js (v14以降)
- Python 3 (開発サーバー用)
- TMDB API キー ([登録はこちら](https://www.themoviedb.org/settings/api))

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd trailer_zapper
```

### 2. 依存関係のインストール

```bash
cd server
npm install
cd ..
```

### 3. 環境変数の設定

`.env.example` をコピーして `.env` ファイルを作成し、TMDB APIキーを設定します。

```bash
cp .env.example .env
```

`.env` ファイルを編集してAPIキーを設定：

```
TMDB_API_KEY=your_actual_api_key_here
PORT=3000
ALLOWED_ORIGINS=http://localhost:8000,http://127.0.0.1:8000
```

### 4. アプリケーションの起動

#### オプション1: 個別起動

ターミナルを2つ開いて、それぞれで以下を実行：

```bash
# ターミナル1: プロキシサーバーを起動
npm run start:server

# ターミナル2: クライアントサーバーを起動
npm run start:client
```

#### オプション2: 一括起動（推奨）

```bash
npm run dev
```

### 5. ブラウザでアクセス

ブラウザで `http://localhost:8000` を開いてアプリケーションを表示します。

## アーキテクチャ

```
フロントエンド (client/)
    ↓ HTTP Request (/api/tmdb/*)
Express.js プロキシ (server/)
    ↓ HTTP Request (with API Key from .env)
TMDB API
```

### セキュリティ

- APIキーは `.env` ファイルでサーバーサイドに安全に保存
- クライアントサイドには一切APIキーが露出しない
- プロキシサーバー経由でTMDB APIにアクセス

### ディレクトリ構造

```
trailer_zapper/
├── client/              # フロントエンドファイル
│   ├── index.html      # UIレイアウト
│   ├── script.js       # アプリケーションロジック
│   └── style.css       # スタイル定義
├── server/              # バックエンドプロキシ
│   ├── index.js        # Expressサーバー
│   ├── package.json    # 依存関係定義
│   └── node_modules/   # インストールされた依存関係
├── openspec/            # OpenSpec変更管理
├── .env                 # 環境変数（Gitで管理しない）
├── .env.example         # 環境変数のテンプレート
├── .gitignore           # Git除外設定
├── package.json         # ルートレベルのスクリプト
└── README.md            # このファイル
```

## 使い方

### キーボードショートカット

- **スペース**: 一時停止/再生
- **N**: 次の予告編
- **P**: 前の予告編
- **F**: フルスクリーン切り替え
- **H**: UI表示/非表示
- **Enter**: 配信サービスで開く

## Vercelへのデプロイ

このアプリケーションは無料でVercelにデプロイできます。

### 1. Vercelアカウントの作成

[Vercel](https://vercel.com)にアクセスしてアカウントを作成します（GitHubアカウントで簡単にサインアップできます）。

### 2. リポジトリのインポート

1. Vercel Dashboardにアクセス
2. "New Project"をクリック
3. GitHubリポジトリ `zrn-ns/trailer_zapper` をインポート

### 3. プロジェクト設定

- **Framework Preset**: `Other`（自動検出されない場合）
- **Root Directory**: `.`（ルートディレクトリのまま）
- **Build Command**: 空欄のままでOK
- **Output Directory**: `public`

### 4. 環境変数の設定

Vercel Dashboardのプロジェクト設定で以下の環境変数を追加：

| 変数名 | 値 | 説明 |
|-------|---|-----|
| `TMDB_API_KEY` | `your_actual_api_key` | TMDB APIキー（必須） |
| `ALLOWED_ORIGINS` | `https://your-app.vercel.app` | 許可するオリジン（オプション） |

### 5. デプロイ

"Deploy"ボタンをクリックしてデプロイを開始します。数分で自動的にデプロイが完了し、URLが発行されます。

### 6. デプロイ後の確認

発行されたURL（例：`https://your-app.vercel.app`）にアクセスして、アプリケーションが正常に動作することを確認します。

### 自動デプロイ

mainブランチに変更をpushすると、Vercelが自動的に再デプロイします。

## トラブルシューティング

### プロキシサーバーが起動しない

1. `.env` ファイルが存在し、`TMDB_API_KEY` が設定されているか確認
2. ポート3000が既に使用されていないか確認: `lsof -ti:3000`
3. Node.jsのバージョンを確認: `node -v` (v14以降が必要)

### クライアントが起動しない

1. Python 3がインストールされているか確認: `python3 --version`
2. ポート8000が既に使用されていないか確認: `lsof -ti:8000`

### APIリクエストが失敗する

1. プロキシサーバーが起動しているか確認
2. ブラウザのコンソールでCORSエラーが出ていないか確認
3. `.env` のAPIキーが正しいか確認
4. `http://localhost:3000/health` にアクセスしてサーバーの状態を確認

### 予告編が再生されない

1. ブラウザのコンソールでエラーを確認
2. YouTube IFrame APIが正常にロードされているか確認
3. ブラウザの自動再生ポリシーを確認（初回はミュート状態で再生されます）

## 開発

### 技術スタック

- **フロントエンド**: Vanilla JavaScript (ES6+)、HTML5、CSS3
- **バックエンド**: Node.js、Express.js
- **外部API**: TMDB API、YouTube IFrame API

### コード規約

- インデント: 2スペース
- コメント: 日本語で記述
- 変数名: camelCase
- 定数: UPPER_SNAKE_CASE

## ライセンス

MIT

## クレジット

このアプリケーションは [The Movie Database (TMDB)](https://www.themoviedb.org/) APIを使用しています。
