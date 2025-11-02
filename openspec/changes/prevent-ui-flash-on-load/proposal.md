# Prevent UI Flash on Load

## Summary
初回ロード時に画像などのリソースが読み込まれる間、オーバーレイUIがチラ見えしてしまう問題を修正します。HTMLに直接`startup-hidden`クラスを追加することで、JavaScriptの実行前からUIを確実に非表示にします。

## Why
現在の実装では、JavaScriptが実行されてから`startup-hidden`クラスが`.ui-layer`要素に追加されます。しかし、HTMLのレンダリングからJavaScriptの実行までの間にUIが表示されてしまい、ユーザー体験を損なっています。特に初回訪問時や低速なネットワーク環境では、この問題が顕著になります。

## What Changes
HTMLファイルの`.ui-layer`要素に、インラインで`startup-hidden`クラスを追加します。これにより、ページロード時から確実にUIが非表示になり、スタートボタンがクリックされた後にのみ表示されるようになります。

## Goals
- ページロード時からUIを確実に非表示にする
- JavaScriptの実行を待たずに初期状態を適用する
- スムーズなユーザー体験を提供する

## Non-Goals
- スタートモーダルの動作変更
- その他のUI要素の初期状態の変更
- パフォーマンス最適化（この変更は視覚的な問題の修正のみ）

## Implementation Overview
1. `client/index.html`の`.ui-layer`要素に`startup-hidden`クラスを追加
2. `public/index.html`の`.ui-layer`要素に`startup-hidden`クラスを追加
3. JavaScriptの`uiLayer.classList.add('startup-hidden')`行は冗長になるが、後方互換性のため残す

## Files Changed
- `client/index.html`: `.ui-layer`要素に`startup-hidden`クラスを追加
- `public/index.html`: `.ui-layer`要素に`startup-hidden`クラスを追加

## Testing
- ブラウザのキャッシュをクリアして初回ロードをシミュレート
- ネットワークスロットリング（Slow 3G）でページをロードし、UIが見えないことを確認
- スタートボタンをクリックして、正常にUIが表示されることを確認

## Deployment
変更はVercelに自動デプロイされ、即座に本番環境に反映されます。
