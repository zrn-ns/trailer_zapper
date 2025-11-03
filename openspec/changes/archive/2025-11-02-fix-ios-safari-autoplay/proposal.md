# Proposal: Fix iOS Safari Autoplay

## Why

iOS Safariでは厳格な自動再生ポリシーにより、現在の実装では動画の自動再生が開始されません。macOS Safariでは動作しますが、iOSでは以下の理由で失敗します：

1. **ユーザージェスチャーのコンテキストが失われる**: クリックから再生までの間に`setTimeout`（500ms）とAPI呼び出しなどの非同期処理を経由するため、iOSはこれをユーザージェスチャーとして認識しません
2. **iOS Safariの厳格な制限**: iOS Safariは、ユーザージェスチャーから直接呼び出されたメディア再生のみを許可します

## What Changes

iOS Safari専用の処理を追加して、ユーザージェスチャーのコンテキストを保持したまま動画再生を開始できるようにします。

### アプローチ

1. **iOS Safari検出**: User Agentを使用してiOS Safariを検出
2. **ダミープレーヤーの事前初期化**: 上映開始ボタンのクリック時に、ユーザージェスチャーのコンテキスト内でYouTube IFrame Player APIを初期化し、ダミー動画（1x1透明動画など）を即座に再生
3. **実際の動画への切り替え**: API呼び出し完了後、実際の予告編動画IDでプレーヤーを更新

### 技術的詳細

- iOS Safari検出: `/iPhone|iPad|iPod/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent) && !/CriOS|FxiOS/.test(navigator.userAgent)`
- ダミー動画: YouTubeの短い無音動画または透明動画を使用
- プレーヤー初期化: `startScreening()`関数内でiOSの場合のみダミープレーヤーを作成
- 動画切り替え: `loadVideoById()` APIを使用して実際の動画に切り替え

## Alternatives Considered

1. **2段階操作**: 最初のクリックで動画を読み込み、「再生」ボタンを表示
   - 却下理由: UXが大きく変わり、既存の映画館体験を損なう

2. **setTimeout削除**: 暗転演出を削除して即座に動画を読み込む
   - 却下理由: 演出が重要なアプリケーションのコンセプトを損なう

3. **iOS専用処理（採用）**: ダミー動画を使用してユーザージェスチャーコンテキストを保持
   - 採用理由: 既存のUXを維持しながら、iOS Safariで動作する

## Dependencies

なし

## Success Criteria

- [x] iPhone SafariでもmacOS Safariと同様に自動再生が動作する
- [x] 既存のデスクトップ環境での動作に影響を与えない
- [x] 暗転演出などの既存のUX体験を維持

## Timeline

小規模な変更のため、即座に実装可能。
