# Tasks: API Key Security Implementation

## Phase 1: プロキシサーバーのセットアップ

### 1. プロジェクト構造の整理

- [x] `client/` ディレクトリを作成し、既存のフロントエンドファイルを移動
  - `index.html`, `script.js`, `style.css`, `tmdb-attribution.svg` を移動
- [x] `server/` ディレクトリを作成
- [x] ルートレベルに `.gitignore` を更新（`.env` を追加）

**検証**: `ls` コマンドで新しいディレクトリ構造を確認

### 2. サーバー側の依存関係セットアップ

- [x] `server/package.json` を作成
  - `express`, `dotenv`, `cors`, `axios` を依存関係に追加
- [x] `server/` ディレクトリで `npm install` を実行

**検証**: `server/node_modules/` が作成され、依存関係がインストールされていることを確認

### 3. 環境変数ファイルの作成

- [x] `.env.example` をルートディレクトリに作成
  - `TMDB_API_KEY=your_api_key_here` のテンプレートを記述
  - `PORT=3000` を追加
  - `ALLOWED_ORIGINS=http://localhost:8000` を追加
- [x] `.env` ファイルを作成し、実際のAPIキーを設定
- [x] `.gitignore` に `.env` を追加（既に追加されていれば確認）

**検証**: `cat .env.example` でテンプレートの内容を確認、`git status` で `.env` が無視されていることを確認

## Phase 2: プロキシサーバーの実装

### 4. 基本的なExpressサーバーの作成

- [x] `server/index.js` を作成
- [x] Express アプリケーションの基本構造を実装
  - `dotenv` で環境変数を読み込み
  - `TMDB_API_KEY` の存在確認（未設定の場合エラー）
  - CORS ミドルウェアの設定
  - ポート 3000 でリッスン

**検証**: `node server/index.js` でサーバーが起動し、エラーなく動作することを確認

### 5. TMDB APIプロキシエンドポイントの実装

- [x] `/api/tmdb/*` エンドポイントを実装
  - パス パラメータからTMDB APIエンドポイントを抽出
  - クエリパラメータを保持
  - `axios` で TMDB API にリクエスト（APIキーを自動付与）
  - レスポンスをクライアントに返す
- [x] エラーハンドリングの実装
  - TMDB APIエラーの転送
  - サーバーエラーの適切な処理
  - タイムアウト設定（10秒）

**検証**: `curl http://localhost:3000/api/tmdb/genre/movie/list` でTMDB APIからデータが返ってくることを確認

### 6. CORS設定の実装

- [x] `cors` ミドルウェアを設定
  - `ALLOWED_ORIGINS` 環境変数から許可するオリジンを読み込み
  - デフォルトで `http://localhost:8000` を許可
- [x] プリフライトリクエストの対応

**検証**: ブラウザコンソールでCORSエラーが発生しないことを確認

## Phase 3: フロントエンドのリファクタリング

### 7. フロントエンドの設定ファイル追加

- [x] `client/config.js` を作成（または `script.js` 内に設定を追加）
  - `API_PROXY_URL` を定義（デフォルト: `http://localhost:3000`）
  - 環境に応じて変更可能にする

**検証**: `cat client/config.js` で設定が正しいことを確認

### 8. fetchFromTMDB関数のリファクタリング

- [x] `script.js` の `TMDB_API_KEY` 定数を削除
- [x] `API_BASE_URL` をプロキシサーバーのURL（`http://localhost:3000/api/tmdb`）に変更
- [x] `fetchFromTMDB` 関数から `api_key` パラメータの追加処理を削除
- [x] その他のAPIリクエストパラメータ（`language`, `region` 等）はそのまま保持

**検証**: ブラウザコンソールで `fetchFromTMDB` を呼び出し、プロキシ経由でデータが取得できることを確認

### 9. 全てのTMDB API呼び出しの動作確認

- [x] ジャンルリストの取得をテスト
- [x] 映画検索（discover API）をテスト
- [x] 予告編情報（videos API）をテスト
- [x] 配信サービス情報（watch/providers API）をテスト

**検証**: アプリケーションを起動し、各機能が正常に動作することを確認

## Phase 4: 開発体験の改善

### 10. npm scriptsの追加

- [x] ルートレベルの `package.json` を作成（存在しない場合）
- [x] 以下のスクリプトを追加:
  - `start:server`: サーバーの起動
  - `start:client`: クライアントの開発サーバー起動（Python/PHP）
  - `dev`: 両方を並行起動（`concurrently` 使用）

**検証**: `npm run dev` で両方のサーバーが起動することを確認

### 11. README.mdの更新

- [x] セットアップ手順を追加
  - `.env` ファイルの作成方法
  - 依存関係のインストール手順
  - サーバーの起動方法
- [x] 環境変数の説明を追加
- [x] トラブルシューティングセクションを追加

**検証**: README.md の手順に従って、新しい開発者が環境をセットアップできることを確認

## Phase 5: テストと検証

### 12. 統合テストの実施

- [x] プロキシサーバーが起動していない場合のエラーハンドリング確認
- [x] 無効なAPIキーでのエラーメッセージ確認
- [x] 複数の映画検索シナリオをテスト
- [x] ネットワークエラー時の挙動確認

**検証**: 各種エラーケースで適切なエラーメッセージが表示されることを確認

### 13. セキュリティ検証

- [x] ブラウザの開発者ツールでネットワークタブを確認し、APIキーが露出していないことを確認
- [x] ソースコードにAPIキーが含まれていないことを確認（`grep -r "d6f89a671e8fecb1f7cd6a6d32c66ff1"` で検索）
- [x] `.env` が `.gitignore` に含まれ、Git追跡対象外であることを確認

**検証**: `git status` で `.env` が表示されず、ブラウザでAPIキーが見えないことを確認

## Phase 6: ドキュメントと最終確認

### 14. プロジェクトドキュメントの更新

- [x] `openspec/project.md` のアーキテクチャセクションを更新
  - 新しいディレクトリ構造を反映
  - プロキシサーバーの説明を追加
- [x] `CLAUDE.md` の開発環境セットアップセクションを更新

**検証**: ドキュメントが最新の実装を正確に反映していることを確認

### 15. 最終動作確認

- [x] クリーンな環境で `.env.example` をコピーして `.env` を作成
- [x] `npm install` と `npm run dev` でアプリケーション全体を起動
- [x] 全ての主要機能（映画検索、予告編再生、フィルタリング等）が正常に動作することを確認

**検証**: エンドツーエンドで全機能が動作し、APIキーが保護されていることを確認

## Dependencies between tasks

- タスク 1-3 は並行実行可能
- タスク 4-6 は順次実行（4 → 5 → 6）
- タスク 7-9 はタスク 6 完了後に実行可能
- タスク 10-11 は他のタスクと並行実行可能
- タスク 12-13 は Phase 3 完了後に実行
- タスク 14-15 は最後に実行

## Estimated effort

- Phase 1: 30分
- Phase 2: 1時間
- Phase 3: 1時間
- Phase 4: 30分
- Phase 5: 45分
- Phase 6: 30分

**合計**: 約4.5時間
