<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# CLAUDE.md

このファイルはClaude Code (claude.ai/code) がこのリポジトリで作業する際のガイダンスを提供します。

## プロジェクト情報

プロジェクトの詳細な情報（技術スタック、アーキテクチャ、規約等）は`openspec/project.md`を参照してください。

## 開発開始

### 初回セットアップ

1. サーバー依存関係をインストール:
```bash
cd server && npm install && cd ..
```

2. `.env.example` をコピーして `.env` を作成し、TMDB APIキーを設定。

### アプリケーションの起動

```bash
# 推奨: サーバーとクライアントを一括起動
npm run dev

# または個別起動
npm run start:server  # プロキシサーバー (port 3000)
npm run start:client  # クライアントサーバー (port 8000)
```

ブラウザで `http://localhost:8000` を開いてアプリケーションを表示します。

## 重要なファイル

- `client/index.html`: UIレイアウト
- `client/script.js`: アプリケーションロジック
- `client/style.css`: スタイル定義
- `server/index.js`: Express.jsプロキシサーバー
- `.env`: 環境変数（APIキー等、Git管理外）
- `.env.example`: 環境変数のテンプレート
- `openspec/project.md`: プロジェクトの詳細情報