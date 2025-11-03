# Proposal: Vercelデプロイ対応

## Why

現在のアプリケーションは開発環境でのみ動作し、外部からアクセスできません。無料でホストできるVercelにデプロイすることで、誰でもアクセスできるWebアプリケーションとして公開できます。

## What Changes

### 現在の構成
- `server/index.js`: Express.jsサーバー（ポート3000）
- `client/`: 静的ファイル（HTML, CSS, JS）
- ローカル環境でのみ動作

### 変更内容

1. **Vercel Serverless Functions化**
   - `server/index.js`の機能を`api/tmdb/[...path].js`に変換
   - Express.jsの代わりにVercel Serverless Function形式を使用
   - 環境変数は Vercel Dashboard で設定

2. **プロジェクト構成の変更**
   - `client/`の内容を`public/`に移動
   - ルートレベルの`package.json`に必要な依存関係を追加
   - `vercel.json`を作成してルーティング設定

3. **CORS設定の更新**
   - Vercelのデプロイ先URLを許可オリジンに追加
   - 本番環境用のCORS設定を適用

4. **デプロイ設定**
   - `vercel.json`: ビルド設定、ルーティング設定
   - `.vercelignore`: デプロイ対象外ファイルの指定

## 影響範囲

- プロジェクト構造全体（ファイル配置の変更）
- `server/index.js`: Vercel Serverless Functionへの変換
- `package.json`: 依存関係の統合
- 新規ファイル: `api/tmdb/[...path].js`, `vercel.json`, `.vercelignore`

## 備考

- ローカル開発環境は引き続き動作（既存のスクリプトを維持）
- Vercel無料プランの制限内で動作（サーバーレス実行時間10秒）
- 環境変数`TMDB_API_KEY`はVercel Dashboardで設定
