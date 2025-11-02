# Tasks: PWA Implementation

## Implementation Tasks

### 1. アプリアイコンの準備

- `client/assets/icons/` ディレクトリを作成
- 192x192ピクセルのアプリアイコンを作成（PNG形式）
- 512x512ピクセルのアプリアイコンを作成（PNG形式）
- アイコンは映画フィルムや予告編を連想させるデザイン
- 各アイコンファイルサイズを最適化（< 50KB for 192px, < 200KB for 512px）

**Dependencies**: なし

**Validation**:
- `client/assets/icons/icon-192x192.png` が存在する
- `client/assets/icons/icon-512x512.png` が存在する
- 各ファイルが正しいサイズ（192x192, 512x512）である
- ファイルサイズが適切に最適化されている

---

### 2. Web App Manifestファイルの作成

- `client/manifest.json` を作成
- アプリ名、説明、アイコン、display mode、テーマカラーを定義
- display: "standalone" を設定
- background_color と theme_color を "#050914" に設定
- orientation: "any" を設定
- start_url: "/" を設定
- アイコンの purpose を "any maskable" に設定

**Dependencies**: タスク1（アイコンファイルが必要）

**Validation**:
- `client/manifest.json` が存在し、有効なJSONである
- 必須フィールド（name, short_name, start_url, display, icons）が含まれる
- アイコンパスが正しい（`/assets/icons/icon-*.png`）
- JSONがバリデーションツールでエラーなし

---

### 3. HTMLへのmanifest linkとiOS PWAメタタグの追加

- `client/index.html` の `<head>` セクションに以下を追加：
  - `<link rel="manifest" href="manifest.json">`
  - `<meta name="theme-color" content="#050914">`
  - `<meta name="apple-mobile-web-app-capable" content="yes">`
  - `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`
  - `<meta name="apple-mobile-web-app-title" content="Trailer Zapper">`
  - `<link rel="apple-touch-icon" href="/assets/icons/icon-192x192.png">`

**Dependencies**: タスク2（manifest.jsonが必要）

**Validation**:
- Chrome DevTools > Application > Manifest でmanifestが表示される
- iOS Safariでホーム画面追加時にアイコンが表示される
- エラーや警告がない

---

### 4. Service Workerファイルの作成

- `client/sw.js` を作成
- CACHE_NAME 定数を定義（例: 'trailer-zapper-v1'）
- ASSETS_TO_CACHE 配列を定義（HTML, CSS, JS, アイコン、音声、画像、YouTube API）
- install イベントリスナーを実装（アセットキャッシュ + skipWaiting）
- activate イベントリスナーを実装（古いキャッシュ削除 + clients.claim）
- fetch イベントリスナーを実装（Cache-First for static, Network-Only for /api/tmdb/*）

**Dependencies**: なし（静的ファイルのみ）

**Validation**:
- `client/sw.js` が存在し、有効なJavaScriptである
- install, activate, fetch イベントリスナーが定義されている
- ASSETS_TO_CACHE に必要なすべてのアセットが含まれる
- 構文エラーがない

---

### 5. Service Worker登録処理の追加

- `client/script.js` に Service Worker 登録コードを追加
- `window.addEventListener('load')` 内で `navigator.serviceWorker.register('/sw.js')` を呼び出す
- 成功時にコンソールログ出力
- 失敗時にエラーログ出力（アプリは継続動作）
- 'serviceWorker' in navigator のチェックを追加

**Dependencies**: タスク4（sw.jsが必要）

**Validation**:
- ページロード時にService Workerが登録される
- Chrome DevTools > Application > Service Workers でワーカーが表示される
- コンソールに "[PWA] Service Worker registered: ..." が表示される
- HTTPSまたはlocalhostで動作する

---

### 6. スタンドアロンモード検出関数の実装

- `client/script.js` に `isStandalone()` 関数を追加
- iOS Safari: `window.navigator.standalone === true` をチェック
- Android/Chrome/その他: `window.matchMedia('(display-mode: standalone)').matches` をチェック
- 関数は boolean を返す
- `state` オブジェクトに `isStandalone` プロパティを追加

**Dependencies**: なし

**Validation**:
- `isStandalone()` 関数が定義されている
- ブラウザモードで `false` を返す
- スタンドアロンモードで `true` を返す（手動テスト: ホーム画面から起動）
- エラーが発生しない

---

### 7. 全画面ボタンのスタンドアロンモード対応

- `client/script.js` の初期化処理に全画面ボタン制御を追加
- `isStandalone()` が `true` の場合、`fullscreenButton.style.display = 'none'` を設定
- コンソールログで "[PWA] Running in standalone mode" を出力
- ブラウザモードでは全画面ボタンを通常通り表示

**Dependencies**: タスク6（isStandalone関数が必要）

**Validation**:
- ブラウザモードで全画面ボタンが表示される
- スタンドアロンモードで全画面ボタンが非表示になる（手動テスト）
- コンソールにログが出力される

---

### 8. インストールバナーHTMLの追加

- `client/index.html` の `</body>` 直前にインストールバナーのHTMLを追加
- バナー構造: アイコン（📱）、タイトル、説明、アクションボタン（インストール、後で）
- 初期状態で `hidden` クラスを付与（display: none）
- id: `pwa-install-banner`, `pwa-install-button`, `pwa-dismiss-button` を設定

**Dependencies**: なし

**Validation**:
- `client/index.html` にバナーHTMLが存在する
- 初期状態でバナーが非表示（hidden class）
- 各要素に正しいidが設定されている

---

### 9. インストールバナーCSSの追加

- `client/style.css` にインストールバナーのスタイルを追加
- 固定配置（position: fixed, bottom: 0）
- z-index: 100（ビデオとUI要素の間）
- 背景: `var(--bg-panel)` with backdrop-filter blur
- スライドアップアニメーション（@keyframes slideUp）
- レスポンシブ対応（モバイル: 全幅、デスクトップ: max-width 600px, center）

**Dependencies**: タスク8（HTMLが必要）

**Validation**:
- CSSが追加され、構文エラーがない
- バナーがhiddenクラスなしで下部に固定表示される
- アニメーションが滑らかに動作する
- モバイルとデスクトップで適切に表示される

---

### 10. beforeinstallprompt イベントハンドリングの実装

- `client/script.js` に `beforeinstallprompt` イベントリスナーを追加
- `event.preventDefault()` を呼び出してデフォルト動作を抑制
- `deferredPrompt` 変数にイベントを保存
- `showInstallBanner()` 関数を呼び出してカスタムバナーを表示
- localStorage の `pwa-install-dismissed` と `pwa-installed` をチェック

**Dependencies**: タスク8, 9（バナーHTMLとCSSが必要）

**Validation**:
- `beforeinstallprompt` イベントが捕捉される
- デフォルトのブラウザプロンプトが表示されない
- カスタムバナーが表示される
- コンソールにログが出力される

---

### 11. インストールバナー表示ロジックの実装

- `client/script.js` に `showInstallBanner()` 関数を実装
- localStorage で `pwa-install-dismissed` と `pwa-installed` をチェック
- 条件を満たす場合のみバナーから `hidden` クラスを削除
- タイムスタンプで7日間の dismiss 期限をチェック
- スタートアップモーダル表示中は遅延表示（3秒後）

**Dependencies**: タスク10（beforeinstallpromptハンドリングが必要）

**Validation**:
- 条件を満たすとバナーが表示される
- 既にインストール済みの場合は表示されない
- 7日以内に dismiss された場合は表示されない
- スタートアップモーダル後に表示される

---

### 12. インストールボタンの実装

- `client/script.js` に `pwa-install-button` のクリックイベントリスナーを追加
- `deferredPrompt.prompt()` を呼び出してブラウザのインストールダイアログを表示
- `deferredPrompt.userChoice` でユーザーの選択を取得
- インストール成功時にバナーを非表示
- `deferredPrompt` を null に設定

**Dependencies**: タスク10（deferredPromptが必要）

**Validation**:
- インストールボタンをクリックするとブラウザダイアログが表示される
- ユーザーがインストールを選択するとアプリがホーム画面に追加される
- バナーが非表示になる
- コンソールにログが出力される

---

### 13. 後でボタンの実装

- `client/script.js` に `pwa-dismiss-button` のクリックイベントリスナーを追加
- バナーに `hidden` クラスを追加して非表示
- `localStorage.setItem('pwa-install-dismissed', timestamp)` で選択を保存
- タイムスタンプで7日後の再表示を管理

**Dependencies**: タスク11（showInstallBanner関数が必要）

**Validation**:
- 後でボタンをクリックするとバナーが非表示になる
- localStorageに dismiss フラグが保存される
- ページをリロードしても7日間はバナーが表示されない
- 7日後は再表示される（タイムスタンプチェック）

---

### 14. appinstalled イベントハンドリングの実装

- `client/script.js` に `appinstalled` イベントリスナーを追加
- `localStorage.setItem('pwa-installed', 'true')` で永続化
- バナーを非表示
- コンソールに "[PWA] App installed" を出力

**Dependencies**: タスク12（インストールボタンが必要）

**Validation**:
- アプリインストール後にイベントが発火する
- localStorageに `pwa-installed` が保存される
- バナーが永久に非表示になる
- コンソールにログが出力される

---

### 15. Service Workerのキャッシュ動作確認

- Chrome DevTools > Application > Cache Storage でキャッシュを確認
- ページロード後にすべてのアセットがキャッシュされることを確認
- オフラインモードで静的アセットが読み込めることを確認
- API呼び出しはオフラインで失敗することを確認（期待される動作）

**Dependencies**: タスク5（Service Worker登録が必要）

**Validation**:
- Cache Storageに `trailer-zapper-v1` キャッシュが存在する
- ASSETS_TO_CACHE のすべてのファイルがキャッシュされている
- オフラインでページが表示される（API呼び出し除く）
- 2回目の読み込みが高速化される

---

### 16. iOS Safariでの動作確認

- 実機のiPhone/iPadでアプリを開く
- Safariで「ホーム画面に追加」を実行
- ホーム画面から起動してスタンドアロンモードを確認
- ブラウザUIが消えることを確認
- 全画面ボタンが非表示になることを確認
- アイコンとスプラッシュ画面が表示されることを確認

**Dependencies**: すべての前タスク

**Validation**:
- iOS Safariでホーム画面に追加できる
- スタンドアロンモードでブラウザUIが消える
- 全画面ボタンが非表示になる
- apple-touch-iconが表示される
- アプリが正常に動作する

---

### 17. Android Chromeでの動作確認

- 実機のAndroidスマートフォンでアプリを開く
- Chromeで「ホーム画面に追加」を実行
- beforeinstallprompt イベントが発火し、カスタムバナーが表示されることを確認
- インストールボタンから追加
- ホーム画面から起動してスタンドアロンモードを確認
- ブラウザUIが消えることを確認

**Dependencies**: すべての前タスク

**Validation**:
- Chromeでインストールバナーが表示される
- インストールボタンでアプリを追加できる
- スタンドアロンモードでブラウザUIが消える
- 全画面ボタンが非表示になる
- アプリが正常に動作する

---

### 18. デスクトップブラウザでの互換性確認

- Chrome, Firefox, Edge, Safariでアプリを開く
- manifestが正しく読み込まれることを確認
- Service Workerが登録されることを確認
- 全画面ボタンが表示されることを確認（ブラウザモード）
- Chromeでインストールバナーが表示されることを確認
- 既存機能がすべて動作することを確認

**Dependencies**: すべての前タスク

**Validation**:
- 各ブラウザでmanifestがエラーなく読み込まれる
- Service Workerが正常に登録される
- 全画面ボタンが表示され、機能する
- 既存の機能に影響がない
- パフォーマンスが低下していない

---

### 19. Lighthouseでの PWA 監査

- Chrome DevTools > Lighthouse を開く
- PWA カテゴリを選択して監査実行
- "Installable" 項目がすべてパスすることを確認
- "PWA Optimized" 項目でスコアを確認
- エラーや警告があれば修正

**Dependencies**: すべての前タスク

**Validation**:
- Lighthouse PWA 監査でエラーがない
- "Installable" がすべてパス
- manifest, Service Worker, HTTPS が検出される
- スコアが90以上（可能な限り）

---

### 20. ドキュメントの更新

- `CLAUDE.md` または README に PWA 機能について記載
- インストール方法の説明を追加
- 対応ブラウザとプラットフォームを記載
- Service Worker のキャッシュ戦略を文書化

**Dependencies**: すべての前タスク

**Validation**:
- ドキュメントにPWA機能の説明がある
- ユーザーがインストール方法を理解できる
- 開発者がService Workerの動作を理解できる

---

## Notes

- タスク1-7: Manifest とスタンドアロン検出（基礎）
- タスク4-5, 15: Service Worker（パフォーマンス向上）
- タスク8-14: インストールバナー（UX向上）
- タスク16-19: 実機テストと検証
- タスク20: ドキュメント

並行作業可能なタスクグループ：
- グループA（Manifest）: タスク1-3
- グループB（Service Worker）: タスク4-5
- グループC（スタンドアロン検出）: タスク6-7
- グループD（インストールバナー）: タスク8-14

グループA, B, C は並行して実施可能。グループDはA, Cに依存。
