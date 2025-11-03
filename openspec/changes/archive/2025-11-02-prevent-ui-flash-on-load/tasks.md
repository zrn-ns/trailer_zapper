# Tasks: Prevent UI Flash on Load

## Implementation Tasks

- [ ] `client/index.html`の`.ui-layer`要素に`startup-hidden`クラスを追加
- [ ] `public/index.html`の`.ui-layer`要素に`startup-hidden`クラスを追加

## Testing Tasks

- [ ] ブラウザキャッシュをクリアして初回ロードをテスト
- [ ] ネットワークスロットリング（Slow 3G）で検証
- [ ] スタートボタンクリック後のUI表示を確認

## Documentation Tasks

- [ ] OpenSpec提案を作成
- [ ] 変更をGitHubにコミット・プッシュ

## Deployment Tasks

- [ ] Vercelに自動デプロイ
- [ ] 本番環境で動作確認
