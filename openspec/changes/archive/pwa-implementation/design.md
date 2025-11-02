# Design: PWA Implementation

## Architecture Overview

PWA化は以下の4つの主要コンポーネントで構成されます：

```
┌─────────────────────────────────────────────────────────┐
│                     client/index.html                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │  <link rel="manifest" href="manifest.json">       │  │
│  │  <meta name="theme-color" content="#050914">      │  │
│  │  <link rel="apple-touch-icon" href="...">         │  │
│  └───────────────────────────────────────────────────┘  │
│                                                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │  インストールバナー UI                              │  │
│  │  (beforeinstallprompt イベント)                    │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            │ Service Worker登録
                            ▼
              ┌─────────────────────────┐
              │  client/sw.js           │
              │  (Service Worker)       │
              │                         │
              │  - アセットキャッシュ    │
              │  - オフライン対応        │
              └─────────────────────────┘
                            │
                            │ manifest参照
                            ▼
              ┌─────────────────────────┐
              │  client/manifest.json   │
              │                         │
              │  - アプリ名/説明         │
              │  - アイコン             │
              │  - display: standalone  │
              │  - テーマカラー         │
              └─────────────────────────┘
```

## Component Design

### 1. Web App Manifest (manifest.json)

**Location**: `client/manifest.json`

**Structure**:
```json
{
  "name": "Trailer Zapper",
  "short_name": "Trailer Zapper",
  "description": "映画の予告編を次々と視聴できるシネマティックなWebアプリ",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#050914",
  "theme_color": "#050914",
  "orientation": "any",
  "icons": [
    {
      "src": "/assets/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/assets/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

**Design Decisions**:
- `display: "standalone"`: ブラウザUIを完全に隠す
- `orientation: "any"`: 横画面・縦画面両方をサポート
- `purpose: "any maskable"`: iOS SafariとAndroid両方で適切に表示

### 2. Service Worker (sw.js)

**Location**: `client/sw.js`

**Caching Strategy**:
- **Cache-First**: 静的アセット（HTML, CSS, JS, アイコン、画像、音声）
- **Network-Only**: TMDB API呼び出し（プロキシ経由、常に最新データが必要）

**Cache Structure**:
```javascript
const CACHE_NAME = 'trailer-zapper-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/script.js',
  '/style.css',
  '/favicon.ico',
  '/assets/sounds/buzzer.mp3',
  '/assets/theater-background.webp',
  '/assets/tmdb-attribution.svg',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
  'https://www.youtube.com/iframe_api'
];
```

**Lifecycle**:
1. **install**: アセットをキャッシュに保存
2. **activate**: 古いキャッシュを削除
3. **fetch**: Cache-FirstまたはNetwork戦略で応答

**Version Management**:
- `CACHE_NAME`にバージョン番号を含める
- 新バージョンデプロイ時は古いキャッシュを削除

### 3. Install Prompt Banner

**Location**: `client/script.js` (既存ファイルに追加)

**UI Design**:
```
┌─────────────────────────────────────────────────┐
│  📱 アプリとして追加して、より快適に視聴       │
│                                                 │
│  [インストール]  [後で]                         │
└─────────────────────────────────────────────────┘
```

**Position**: 画面下部、固定配置、z-index: 100

**Display Logic**:
- `beforeinstallprompt`イベント発火時に表示
- 「後で」ボタン: バナーを閉じる（localStorage に dismiss フラグ）
- 「インストール」ボタン: `prompt()`を呼び出してインストールダイアログ表示
- インストール完了後: バナーを永久に非表示

**localStorage Key**:
- `pwa-install-dismissed`: ユーザーが「後で」を選択した場合
- `pwa-installed`: インストール完了後

### 4. Standalone Mode Detection

**Location**: `client/script.js` (既存ファイルに追加)

**Detection Logic**:
```javascript
function isStandalone() {
  // iOS Safari standalone mode
  if (window.navigator.standalone === true) {
    return true;
  }
  // Android Chrome standalone mode
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  return false;
}
```

**Fullscreen Button Control**:
```javascript
// スタンドアロンモードでは全画面ボタンを非表示
if (isStandalone()) {
  fullscreenButton.style.display = 'none';
}
```

## Integration Points

### 1. HTML Modifications (client/index.html)

`<head>`に以下を追加：
```html
<!-- PWA Manifest -->
<link rel="manifest" href="manifest.json">
<meta name="theme-color" content="#050914">

<!-- iOS Safari PWA Support -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Trailer Zapper">
<link rel="apple-touch-icon" href="/assets/icons/icon-192x192.png">
```

`<body>`の最後（`</body>`の直前）に以下を追加：
```html
<!-- PWA Install Banner -->
<div id="pwa-install-banner" class="pwa-install-banner hidden">
  <div class="pwa-install-banner__content">
    <div class="pwa-install-banner__icon">📱</div>
    <div class="pwa-install-banner__text">
      <p class="pwa-install-banner__title">アプリとして追加</p>
      <p class="pwa-install-banner__description">ホーム画面から簡単にアクセスできます</p>
    </div>
    <div class="pwa-install-banner__actions">
      <button id="pwa-install-button" class="ghost-button">インストール</button>
      <button id="pwa-dismiss-button" class="ghost-button">後で</button>
    </div>
  </div>
</div>
```

### 2. JavaScript Modifications (client/script.js)

アプリ初期化時に以下を追加：
```javascript
// Service Worker登録
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('[PWA] Service Worker registered:', registration.scope);
      })
      .catch(error => {
        console.error('[PWA] Service Worker registration failed:', error);
      });
  });
}

// スタンドアロンモード検出と全画面ボタン制御
if (isStandalone()) {
  console.log('[PWA] Running in standalone mode');
  if (fullscreenButton) {
    fullscreenButton.style.display = 'none';
  }
}

// インストール促進バナー
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallBanner();
});

window.addEventListener('appinstalled', () => {
  console.log('[PWA] App installed');
  hideInstallBanner();
  localStorage.setItem('pwa-installed', 'true');
});
```

### 3. CSS Modifications (client/style.css)

インストールバナーのスタイル：
```css
.pwa-install-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--bg-panel);
  border-top: 1px solid var(--border-glow);
  backdrop-filter: blur(16px);
  padding: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: slideUp 0.3s ease-out;
}

.pwa-install-banner.hidden {
  display: none;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
```

## Trade-offs and Decisions

### Decision 1: Cache-First for Static Assets
**Rationale**: 静的アセットは変更頻度が低く、キャッシュからの読み込みでパフォーマンスが向上
**Trade-off**: 新バージョンデプロイ時にキャッシュクリアが必要（バージョン管理で対応）

### Decision 2: Network-Only for API Calls
**Rationale**: 映画データは常に最新が必要、オフラインでの視聴は現実的でない
**Trade-off**: オフライン時はAPI呼び出しが失敗するが、これは期待される動作

### Decision 3: インストールバナーは下部固定
**Rationale**: 既存のUIを邪魔せず、かつ目立つ位置
**Trade-off**: 一時的に画面下部が隠れるが、「後で」で閉じられる

### Decision 4: スタンドアロンモードで全画面ボタン非表示
**Rationale**: standaloneモードではすでにブラウザUIがないため、全画面ボタンは不要
**Trade-off**: 通常ブラウザでは全画面ボタンが表示されるため、一貫性が若干損なわれる

## Testing Strategy

### Manual Testing Checklist
1. **Manifest検証**: Chrome DevToolsのApplicationタブでmanifest.jsonが正しく読み込まれているか
2. **Service Worker検証**: ApplicationタブでService Workerが登録されているか
3. **インストール検証**: ブラウザの「ホーム画面に追加」でインストールできるか
4. **スタンドアロン起動**: ホーム画面から起動してブラウザUIが消えるか
5. **全画面ボタン**: スタンドアロンモードで全画面ボタンが非表示になるか
6. **キャッシュ検証**: オフラインで静的アセットが読み込めるか（API呼び出しは除く）

### Browser Testing
- **iOS Safari**: standalone mode、apple-touch-icon
- **Android Chrome**: standalone mode、インストールプロンプト
- **Desktop Chrome**: インストールバナー、全画面ボタン表示

## Security Considerations

1. **HTTPS必須**: Service WorkerはHTTPS環境でのみ動作（localhost除く）
2. **CORS**: Service WorkerはSame-Origin Policyに従う
3. **キャッシュポリズニング**: キャッシュするアセットのURLを厳密に管理

## Performance Implications

### Positive
- 2回目以降の起動が高速化（キャッシュから読み込み）
- ネットワーク使用量の削減

### Negative
- 初回起動時にService Workerの登録とキャッシュ作成でわずかなオーバーヘッド
- ストレージ使用量の増加（数MB程度）

## Rollback Plan

万が一問題が発生した場合：
1. `sw.js`を削除
2. `manifest.json`へのリンクを削除
3. Service Worker登録コードをコメントアウト
4. キャッシュは次回の登録解除時に自動削除される
