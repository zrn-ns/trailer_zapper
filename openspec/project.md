# Project Context

## Purpose
Trailer Zapperは、映画の予告編を次々と視聴できるシネマティックなWebアプリケーションです。TikTokのような没入型体験を提供し、ユーザーは配信サービスやジャンルでフィルタリングした映画の予告編を連続して視聴できます。

### 主な機能
- TMDB APIを使用した映画データの取得
- YouTube IFrame APIによる予告編の再生
- 配信サービス（Netflix、Amazon Prime等）によるフィルタリング
- ジャンル（ホワイトリスト方式）によるフィルタリング
- 興味なし機能（localStorageで永続化）
- 視聴履歴の管理
- フルスクリーン対応
- キーボードショートカット対応

## Tech Stack
- **フロントエンド**: Vanilla JavaScript (ES6+)、HTML5、CSS3
- **バックエンド**: Node.js、Express.js（APIプロキシサーバー）
- **外部API**:
  - TMDB API（映画データ取得）
  - YouTube IFrame API（予告編再生）
- **ビルドツール**: なし
- **開発サーバー**:
  - プロキシサーバー: Node.js/Express (port 3000)
  - クライアントサーバー: Python http.server (port 8000)

## Project Conventions

### Code Style
- **インデント**: 2スペース
- **コメント**: 日本語で記述
- **変数名**: 意味のある英語名（camelCase）
- **関数名**: 動詞で始まる英語名（camelCase）
- **定数**: UPPER_SNAKE_CASE
- **文字列**: シングルクォート優先
- **セミコロン**: 必須

### Architecture Patterns
- **ファイル構成**: クライアント/サーバー分離構成
  - `client/`: フロントエンドファイル
    - `index.html`: UIレイアウトとコンポーネント定義
    - `script.js`: すべてのアプリケーションロジック（約700行）
    - `style.css`: シネマティックなビジュアルデザイン
  - `server/`: バックエンドプロキシ
    - `index.js`: Express.jsプロキシサーバー
    - `package.json`: サーバー依存関係
- **APIアーキテクチャ**: プロキシパターン
  - フロントエンド → Express.js プロキシ (`/api/tmdb/*`) → TMDB API
  - APIキーはサーバーサイドの `.env` ファイルで安全に管理
  - クライアントサイドには一切APIキーが露出しない
- **状態管理**: グローバルstateオブジェクト（script.js:52-69）
  ```javascript
  const state = {
      movies: [],              // 現在の映画リスト
      history: [],             // 視聴履歴（インデックスの配列）
      currentMovieIndex: 0,    // 現在表示中の映画のインデックス
      selectedProviders: [],   // 選択された配信サービス
      ignoredMovies: Set(),    // 興味なしマークされた映画ID
      selectedGenres: Set(),   // 選択されたジャンルID（ホワイトリスト）
      youtubePlayer: null,     // YouTube IFrame Playerインスタンス
      processedMovies: Set(),  // 処理済み映画ID（再表示防止）
  }
  ```
- **データ永続化**: localStorage（配信サービス、興味なしリスト、視聴済み映画、選択ジャンル）
- **UI制御**: 二層構造（ビデオレイヤー z-index:1、UIレイヤー z-index:2）
  - UI表示/非表示: 手動切り替えとタイムアウトによる自動非表示
  - フルスクリーン対応: immersive-stageコンテナ全体をフルスクリーン化
  - キーボードショートカット:
    - スペース: 一時停止/再生
    - N/P: 次/前の予告編
    - F: フルスクリーン切り替え
    - H: UI表示/非表示
    - Enter: 配信サービスで開く
- **エラーハンドリング**: try-catchとconsole.error

### Testing Strategy
- **基本方針**: テスト駆動開発（TDD）を推奨
- **テストサイクル**: Red-Green-Refactor
- **現状**: テストフレームワーク未導入（将来的に導入予定）
- **手動テスト**: ブラウザコンソールでのデバッグ

### Git Workflow
- **ブランチ戦略**: main ブランチで直接作業
- **コミット粒度**: 意味のある単位でコミット（機能追加、バグ修正、リファクタリング等）
- **コミットメッセージ**: 日本語、以下の形式を使用
  ```
  [略語]: 変更内容の概要

  詳細な説明（必要に応じて）
  - 変更点1
  - 変更点2

  Co-Authored-By: Claude <noreply@anthropic.com>
  ```
- **使用可能な略語**:
  - `feat`: 新しい機能やファイルの追加
  - `fix`: バグ修正
  - `refactor`: 動作が変わらないコードの改善
  - `update`: 既存機能の拡張・改良
  - `style`: コードスタイル・フォーマットの修正
  - `docs`: ドキュメント関連の変更
  - `test`: テストの追加・修正
  - `config`: 設定ファイル関連の変更
  - `remove`: 不要なコードやファイルの削除
- **禁止事項**:
  - force push（--force, --force-with-lease）
  - 他人のPRの編集
  - 共有リポジトリでの破壊的操作

## Domain Context

### 映画予告編体験
- **没入型UI**: 全画面表示でシネマティックな体験を提供
- **自動遷移**: 予告編がない場合や再生完了時は自動的に次の映画へ
- **興味なし機能**: 一度「興味なし」にした映画は二度と表示されない
- **履歴管理**: 前の映画に戻ることができる（履歴スタック）

### TMDB APIの制約
- **レート制限**: 1秒あたりの最大リクエスト数に注意
- **配信サービス情報**: watch/providers APIで取得
- **予告編情報**: videos APIで取得（日本語優先、なければ英語）
- **ジャンル情報**: genre/movie/list APIで取得

### YouTube IFrame API
- **自動再生**: ブラウザのポリシーにより初回はミュート状態
- **プレーヤー制御**: state変更イベントで再生終了を検知
- **エラーハンドリング**: 予告編が再生できない場合は次の映画へ

## Important Constraints

### セキュリティ
- **APIキー**: Express.jsプロキシサーバーで安全に管理
  - `.env` ファイルでサーバーサイドに保存
  - クライアントサイドには一切露出しない
  - `.gitignore` で `.env` をGit追跡対象外に設定
- **機密情報**: .envファイルはコミット禁止（.gitignoreで保護）

### ブラウザ互換性
- **モダンブラウザ**: ES6+、Fetch API、localStorage対応が必須
- **YouTube自動再生**: ブラウザのautoplayポリシーに依存

### パフォーマンス
- **ページング**: TMDB APIは1ページ20件まで
- **キャッシュ**: 処理済み映画IDをSetで管理（メモリ使用量に注意）

## External Dependencies

### TMDB API (v3)
- **ベースURL**: `https://api.themoviedb.org/3`
- **主要エンドポイント**:
  - `/discover/movie`: 映画の検索（配信サービス、ジャンルでフィルタリング）
  - `/genre/movie/list`: ジャンルリスト取得
  - `/movie/{id}/videos`: 予告編情報取得
  - `/movie/{id}/watch/providers`: 配信サービス情報取得
- **認証**: APIキー（クエリパラメータ）
- **地域設定**: `region=JP`（日本）

### YouTube IFrame API
- **ライブラリURL**: `https://www.youtube.com/iframe_api`
- **プレーヤー制御**: YT.Playerインスタンス
- **イベント**: onReady, onStateChange, onError

### TMDB Attribution
- **ロゴ表示**: TMDB Attribution logo（tmdb-attribution.svg）を表示
- **要件**: TMDBのデータを使用する場合、適切なattributionが必要
