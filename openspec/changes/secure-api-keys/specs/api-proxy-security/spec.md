# Spec: API Proxy Security

## Overview

TMDB APIキーをクライアントサイドから完全に分離し、Express.jsプロキシサーバー経由で安全にアクセスできるようにする。

## ADDED Requirements

### Requirement: プロキシサーバーの実装

The system SHALL implement an Express.js-based proxy server that relays requests to the TMDB API.

#### Scenario: TMDB APIへの基本的なプロキシリクエスト

**Given**: プロキシサーバーが起動している
**When**: クライアントが `/api/tmdb/discover/movie?page=1` にGETリクエストを送信
**Then**: サーバーは TMDB API `https://api.themoviedb.org/3/discover/movie?api_key=xxx&page=1` にリクエストを転送し、レスポンスをそのまま返す

#### Scenario: エンドポイントパスの動的マッピング

**Given**: プロキシサーバーが起動している
**When**: クライアントが `/api/tmdb/genre/movie/list` にGETリクエストを送信
**Then**: サーバーは TMDB API `/genre/movie/list` エンドポイントにマッピングしてリクエストを転送

#### Scenario: クエリパラメータの転送

**Given**: プロキシサーバーが起動している
**When**: クライアントが `/api/tmdb/discover/movie?page=2&with_genres=28` にリクエスト
**Then**: サーバーはクエリパラメータ `page=2&with_genres=28` を保持し、APIキーを追加してTMDBに転送

### Requirement: 環境変数によるAPIキー管理

The system SHALL manage the API key in a `.env` file and load it at server startup.

#### Scenario: 環境変数からのAPIキー読み込み

**Given**: `.env` ファイルに `TMDB_API_KEY=abc123` が定義されている
**When**: サーバーが起動
**Then**: サーバーは環境変数 `TMDB_API_KEY` を読み込み、TMDB APIリクエストに使用

#### Scenario: APIキー未設定時のエラー

**Given**: `.env` ファイルに `TMDB_API_KEY` が定義されていない
**When**: サーバーが起動
**Then**: サーバーは起動に失敗し、エラーメッセージ「TMDB_API_KEY is not configured」を表示

#### Scenario: .env.example によるテンプレート提供

**Given**: プロジェクトに `.env.example` ファイルが存在
**When**: 開発者が環境を初期セットアップ
**Then**: `.env.example` をコピーして `.env` を作成し、実際のAPIキーを設定できる

### Requirement: CORS設定

The proxy server SHALL allow cross-origin requests from both local development and production environments.

#### Scenario: ローカル開発環境からのリクエスト

**Given**: フロントエンドが `http://localhost:8000` で動作
**When**: `http://localhost:8000` からプロキシサーバーの `/api/tmdb/*` にリクエスト
**Then**: CORS ヘッダーにより、リクエストが許可される

#### Scenario: プロダクション環境からのリクエスト

**Given**: フロントエンドが `https://example.com` で動作し、`ALLOWED_ORIGINS` 環境変数に設定されている
**When**: `https://example.com` からプロキシサーバーにリクエスト
**Then**: CORS ヘッダーにより、リクエストが許可される

### Requirement: エラーハンドリング

The proxy server SHALL properly handle TMDB API errors and server errors, and return them to the client.

#### Scenario: TMDB APIエラーの転送

**Given**: プロキシサーバーが起動している
**When**: TMDB APIが 401 Unauthorized エラーを返す
**Then**: プロキシサーバーはステータスコード 401 とエラーメッセージをクライアントに転送

#### Scenario: サーバー内部エラー

**Given**: プロキシサーバーが起動している
**When**: TMDB APIへのリクエスト処理中に予期しないエラーが発生
**Then**: プロキシサーバーは 500 Internal Server Error をクライアントに返し、エラー詳細はサーバーログに記録

#### Scenario: タイムアウト処理

**Given**: プロキシサーバーが起動している
**When**: TMDB APIへのリクエストが10秒以内に完了しない
**Then**: プロキシサーバーはリクエストをタイムアウトさせ、504 Gateway Timeout をクライアントに返す

### Requirement: セキュリティ強化

The project SHALL prevent API keys from being accidentally committed to the repository through .gitignore configuration.

#### Scenario: .envファイルのGit除外

**Given**: `.gitignore` ファイルが存在
**When**: `.env` ファイルが作成される
**Then**: Git は `.env` ファイルを追跡対象外とし、`git status` に表示されない

#### Scenario: .env.exampleはコミット可能

**Given**: `.env.example` ファイルが存在
**When**: `git add` を実行
**Then**: `.env.example` は追跡対象となり、リポジトリにコミット可能

## MODIFIED Requirements

### Requirement: フロントエンドのAPIリクエスト先変更

The existing `fetchFromTMDB` function SHALL be modified to send requests to the proxy server instead of directly to the TMDB API.

#### Scenario: プロキシ経由でのdiscover API呼び出し

**Given**: フロントエンドがプロキシサーバーに接続可能
**When**: `fetchFromTMDB('/discover/movie', {page: 1})` を呼び出し
**Then**: リクエストは `http://localhost:3000/api/tmdb/discover/movie?page=1` に送信される（APIキーは含まれない）

#### Scenario: プロキシ経由でのgenre API呼び出し

**Given**: フロントエンドがプロキシサーバーに接続可能
**When**: `fetchFromTMDB('/genre/movie/list')` を呼び出し
**Then**: リクエストは `http://localhost:3000/api/tmdb/genre/movie/list` に送信される

#### Scenario: プロキシ経由でのvideos API呼び出し

**Given**: フロントエンドがプロキシサーバーに接続可能
**When**: `fetchFromTMDB('/movie/123/videos')` を呼び出し
**Then**: リクエストは `http://localhost:3000/api/tmdb/movie/123/videos` に送信される

## REMOVED Requirements

### Requirement: クライアントサイドでのAPIキー管理

The hardcoded API key in script.js SHALL be removed.

#### Scenario: APIキー定数の削除

**Given**: `script.js:9` に `const TMDB_API_KEY = 'd6f89a671e8fecb1f7cd6a6d32c66ff1';` が存在
**When**: セキュリティ改善を適用
**Then**: `TMDB_API_KEY` 定数は削除され、クライアントサイドコードには一切存在しない

#### Scenario: fetchFromTMDB関数からのAPIキー削除

**Given**: `fetchFromTMDB` 関数が `api_key: TMDB_API_KEY` をクエリパラメータに追加している
**When**: プロキシ対応に変更
**Then**: `api_key` パラメータの追加処理は削除され、プロキシサーバーが自動追加する

## Dependencies

なし（新規機能のため）

## Related Capabilities

なし（初期の仕様のため）
