# 設計ドキュメント

## アーキテクチャ概要

スケルトンUIの実装は、既存のコードベースに最小限の変更で統合できるよう設計されています。主要な変更点は以下の3つのレイヤーに分散されます:

1. **プレゼンテーション層（CSS）**: スケルトンの外観とアニメーション
2. **マークアップ層（HTML）**: スケルトンの構造定義
3. **ロジック層（JavaScript）**: スケルトンの表示/非表示制御

## コンポーネント設計

### 1. スケルトンスタイル（CSS）

#### 設計原則

- **モジュール性**: `.skeleton` 基本クラス + バリエーションクラス
- **再利用性**: 他のUI要素にも適用可能な汎用的な設計
- **パフォーマンス**: GPU加速プロパティのみ使用（transform, opacity）

#### クラス構造

```
.skeleton (基本クラス)
├── .skeleton-poster (ポスター画像用)
├── .skeleton-title (タイトル用)
└── .skeleton-text (テキスト用)
```

#### アニメーション戦略

- **グラデーションスライド**: `background-position` を変更してグラデーションを移動
- **無限ループ**: `animation-iteration-count: infinite`
- **滑らかな動き**: `ease-in-out` タイミング関数

### 2. スケルトンマークアップ（HTML）

#### 構造

スケルトンは既存の `.info-panel` 構造と同じ階層を持ちます:

```html
<section id="movie-info" class="info-panel loading">
    <div class="skeleton skeleton-poster"></div>
    <div class="movie-details">
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text"></div>
    </div>
</section>
```

#### 状態管理

- `.loading` クラスで読み込み中状態を管理
- スケルトン表示時: `.loading` クラスを追加
- コンテンツ表示時: `.loading` クラスを削除

### 3. スケルトン制御ロジック（JavaScript）

#### 関数設計

##### `displayMovieInfoSkeleton()`

**責務**: スケルトンUIの表示

```javascript
function displayMovieInfoSkeleton() {
    movieInfoContainer.innerHTML = /* スケルトンHTML */;
    movieInfoContainer.classList.add('loading');
}
```

**呼び出しタイミング**:
- `loadAndDisplayTrailer()` の開始時（API通信前）
- 前の作品から次の作品への切り替え時

##### `displayMovieInfo()` の拡張

**既存の責務**: 作品情報の表示
**追加の責務**: 画像のpreloadとスムーズな切り替え

```javascript
async function displayMovieInfo(movie) {
    // 1. 画像のpreload
    const img = new Image();
    img.src = posterPath;
    await img.decode();

    // 2. スケルトン状態を解除
    movieInfoContainer.classList.remove('loading');

    // 3. コンテンツを挿入
    movieInfoContainer.innerHTML = /* 実際のコンテンツ */;

    // 4. フェードインアニメーション
    movieInfoContainer.style.animation = 'fadeIn 0.3s ease-out';
}
```

#### エラーハンドリング

画像読み込み失敗時も、レイアウトシフトを防ぐためプレースホルダー画像を同じサイズで表示:

```javascript
img.decode().catch(() => {
    console.warn('画像の読み込みに失敗しました');
    // プレースホルダー画像（"No Image"）を使用
});
```

## レイアウトシフト対策

### 問題の根本原因

1. **画像の高さ不定**: `<img>` 要素は読み込み完了まで高さが確定しない
2. **テキストの動的な長さ**: タイトルやあらすじの長さが作品ごとに異なる
3. **非同期読み込み**: API通信とDOM操作のタイミングのずれ

### 解決策

#### 1. アスペクト比の事前確保

```css
.skeleton-poster {
    aspect-ratio: 2 / 3; /* ポスター画像の標準比率 */
}

.info-panel img {
    aspect-ratio: 2 / 3; /* 実際の画像にも同じ比率を適用 */
}
```

#### 2. 最小高さの統一

```css
.info-panel {
    min-height: 400px; /* スケルトンとコンテンツで同じ高さ */
}
```

#### 3. 段階的な読み込み

```
1. スケルトン表示（即座）
   ↓
2. 画像preload（バックグラウンド）
   ↓
3. コンテンツ挿入（画像読み込み完了後）
   ↓
4. フェードイン（視覚的なフィードバック）
```

## パフォーマンス考慮事項

### CSS最適化

- **will-change**: 使用しない（常にアニメーションするため不要）
- **transform**: 使用しない（background-positionで十分）
- **GPU加速**: background-positionは自動的にGPU加速される

### JavaScript最適化

- **Image.decode()**: 非同期画像デコードでメインスレッドをブロックしない
- **requestAnimationFrame**: 使用しない（CSSアニメーションで十分）

## 拡張性

今後、以下の機能拡張が可能です:

1. **ジャンルタグのスケルトン**: 現在はタイトルのみだが、ジャンルタグも追加可能
2. **ボタンのスケルトン**: "配信サービスで開く" ボタンのスケルトン
3. **プログレスインジケーター**: 読み込み進捗の表示（%）

## テスト戦略

### 1. ビジュアルリグレッションテスト

- デスクトップ/モバイルでスクリーンショット比較
- スケルトンの見た目が崩れていないか確認

### 2. パフォーマンステスト

- Chrome DevToolsで CLS（Cumulative Layout Shift）を測定
- 目標: CLS < 0.1（Good）

### 3. ネットワーク遅延テスト

- Chrome DevToolsで "Slow 3G" をシミュレート
- スケルトンが適切に表示されるか確認

## 既存コードへの影響

### 変更が必要なファイル

1. **client/style.css**
   - スケルトンスタイルの追加（約50行）
   - 既存スタイルへの影響: なし

2. **client/script.js**
   - `displayMovieInfoSkeleton()` 関数の追加（約10行）
   - `displayMovieInfo()` 関数の修正（約20行）
   - `loadAndDisplayTrailer()` 関数の修正（1行追加）

### 破壊的変更

- なし（既存機能は完全に維持）

### 後方互換性

- すべての既存機能は変更なし
- 新機能はオプトイン不要（自動的に有効化）

## リスク分析

### 低リスク

- **CSSアニメーション**: 広くサポートされている技術
- **aspect-ratio**: モダンブラウザで100%サポート（Safari 15+, Chrome 88+, Firefox 89+）
- **Image.decode()**: サポートされていないブラウザではfallbackが動作

### 対策

- **aspect-ratio非サポート**: padding-topハックでフォールバック（必要に応じて）
- **Image.decode()非サポート**: onloadイベントでフォールバック

## 参考資料

- [Skeleton Screens - Material Design](https://material.io/design/communication/data-visualization.html#loading-data)
- [Building Skeleton Screens with CSS](https://css-tricks.com/building-skeleton-screens-css-custom-properties/)
- [Cumulative Layout Shift - Web Vitals](https://web.dev/cls/)
- [Image.decode() - MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decode)
