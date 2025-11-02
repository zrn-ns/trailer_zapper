# Implementation Tasks

## Task 1: プロジェクト構成の変更
- [x] `client/`ディレクトリの内容を`public/`に移動
- [x] ルートレベルの`package.json`に依存関係を追加（axios, cors）
- [x] `.vercelignore`を作成
- **Verification**: `public/`に静的ファイルが正しく配置されている

## Task 2: Vercel Serverless Function作成
- [x] `api/tmdb/[...path].js`を作成
- [x] `server/index.js`のロジックをServerless Function形式に変換
- [x] CORS設定を Vercel 対応に更新
- [x] エラーハンドリングを維持
- **Verification**: Serverless Functionがローカルで動作確認可能

## Task 3: Vercel設定ファイル作成
- [x] `vercel.json`を作成
- [x] ルーティング設定（`/api/tmdb/*` → Serverless Function）
- [x] 静的ファイル配信設定（`public/` → ルート）
- [x] 環境変数の設定ガイドをREADMEに追加
- **Verification**: `vercel.json`が正しいフォーマットである

## Task 4: ローカル開発環境の維持
- [x] 既存の`npm run dev`スクリプトを維持
- [x] `server/`ディレクトリは残す（ローカル開発用）
- [x] READMEにローカル開発とデプロイの両方の手順を記載
- **Verification**: ローカル開発環境が引き続き動作する

## Task 5: Vercelデプロイ準備
- [x] READMEにVercelデプロイ手順を追加
- [x] 環境変数設定手順を記載（`TMDB_API_KEY`）
- [x] デプロイ後の確認手順を記載
- **Verification**: READMEの手順に従ってデプロイできる

## Dependencies
- Task 1は独立して実行可能
- Task 2はTask 1の後に実行（ディレクトリ構成が必要）
- Task 3はTask 2の後に実行（Serverless Functionの存在が必要）
- Task 4はTask 1-3と並行可能
- Task 5はすべてのタスク完了後に実行
