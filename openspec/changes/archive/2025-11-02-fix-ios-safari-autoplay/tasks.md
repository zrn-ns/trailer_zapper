# Tasks: Fix iOS Safari Autoplay

## Implementation Tasks

### 1. iOS Safari検出ユーティリティを追加

- `client/script.js`にiOS Safariを検出する関数を追加
- User Agentを使用して、iPhone、iPad、iPodのSafariを検出
- ChromeやFirefoxなど、iOSの他のブラウザは除外

**Dependencies**: なし

**Validation**:
- iPhoneのSafariで検出されることを確認
- iPhoneのChrome（CriOS）で検出されないことを確認
- macOS Safariで検出されないことを確認

---

### 2. iOS Safari専用のダミープレーヤー初期化処理を追加

- `startScreening()`関数内で、iOS Safariの場合のみダミープレーヤーを初期化
- ユーザージェスチャーコンテキスト内で即座にYouTube IFrame Player APIを初期化
- ダミー動画を使用（短い無音動画または適切なプレースホルダー）
- プレーヤーを`state`に保存

**Dependencies**: タスク1

**Validation**:
- iPhoneのSafariでダミープレーヤーが初期化されることを確認
- デスクトップブラウザでダミープレーヤーが初期化されないことを確認

---

### 3. 実際の動画への切り替え処理を実装

- `displayTrailer()`関数を修正して、iOS Safari用の既存プレーヤーがある場合は`loadVideoById()`を使用
- ダミープレーヤーから実際の予告編動画に切り替え
- 既存の非iOS処理は維持

**Dependencies**: タスク2

**Validation**:
- iPhoneのSafariで実際の動画に切り替わることを確認
- 動画が自動再生されることを確認
- デスクトップブラウザで既存の動作が維持されることを確認

---

### 4. エラーハンドリングとフォールバック処理

- ダミー動画の読み込みに失敗した場合のエラーハンドリング
- iOS Safari検出が失敗した場合のフォールバック処理
- ログ出力を追加して、デバッグを容易にする

**Dependencies**: タスク3

**Validation**:
- エラーが発生しても適切にフォールバックすることを確認
- コンソールに適切なログが出力されることを確認

---

### 5. 実機テストとデバッグ

- 実際のiPhoneでテスト
- iPadでテスト
- macOS Safariで既存の動作を確認
- Chromeで既存の動作を確認

**Dependencies**: タスク4

**Validation**:
- iPhone SafariでmacOS Safariと同様に自動再生が動作することを確認
- 暗転演出などの既存のUX体験が維持されることを確認
- デスクトップ環境での動作に影響がないことを確認

---

## Notes

- ダミー動画のIDは実装時に決定（YouTubeの短い無音動画を使用）
- iOS Safari検出ロジックは、将来的にiPadOSの変更に対応できるよう、柔軟に設計
- この変更は既存のデスクトップユーザーの体験に影響を与えない
