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

```bash
# ローカル開発サーバーの起動
python3 -m http.server 8000
# または
php -S localhost:8000
```

ブラウザで `http://localhost:8000` を開いてアプリケーションを表示します。

## 重要なファイル

- `index.html`: UIレイアウト
- `script.js`: アプリケーションロジック
- `style.css`: スタイル定義
- `openspec/project.md`: プロジェクトの詳細情報