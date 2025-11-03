# スケルトンUI仕様

## ADDED Requirements

### Requirement: スケルトンUIの基本構造

作品情報パネルはスケルトンUI（プレースホルダー）を実装し、コンテンツ読み込み中に表示しなければならない（MUST）。

#### Scenario: 作品情報読み込み開始時

**Given** ユーザーが新しい作品に切り替えた時
**When** 作品情報の読み込みが開始される
**Then** スケルトンUIが即座に表示される
**And** スケルトンはポスター画像、タイトル、あらすじの領域を含む
**And** スケルトンはアニメーションで「読み込み中」を表現する

#### Scenario: 作品情報読み込み完了時

**Given** スケルトンUIが表示されている状態
**When** 作品情報の読み込みが完了する
**Then** スケルトンUIがフェードアウトする
**And** 実際のコンテンツがフェードインで表示される
**And** レイアウトシフトが発生しない

### Requirement: スケルトンのビジュアルデザイン

スケルトンUIは視覚的に「読み込み中」であることを明確に伝えなければならない（MUST）。

#### Scenario: スケルトンの外観

**Given** スケルトンUIが表示されている時
**Then** 背景色はパネルの背景より明るいグレー系の色
**And** グラデーションが左から右へ流れるアニメーションが実行される
**And** アニメーションは滑らかで、1.5秒周期で繰り返される

#### Scenario: スケルトンの形状

**Given** スケルトンUIが表示されている時
**Then** ポスター画像用スケルトンは2:3のアスペクト比を持つ
**And** タイトル用スケルトンは高さ2rem、幅80%の矩形
**And** あらすじ用スケルトンは3行分の矩形（各行高さ1rem、行間0.5rem）

### Requirement: レスポンシブ対応

スケルトンUIは横並び・縦スクロール両方のレイアウトで適切に表示されなければならない（MUST）。

#### Scenario: 横並びレイアウト（>1024px）

**Given** ブラウザ幅が1024pxより大きい時
**When** スケルトンUIが表示される
**Then** ポスター画像スケルトンは幅clamp(160px, 20vw, 240px)で表示される
**And** 詳細情報スケルトンは右側に配置される

#### Scenario: 縦スクロールレイアウト（≤1024px）

**Given** ブラウザ幅が1024px以下の時
**When** スケルトンUIが表示される
**Then** ポスター画像スケルトンは中央に配置され、幅min(60%, 180px)で表示される
**And** 詳細情報スケルトンは下側に配置される

### Requirement: パフォーマンス要件

スケルトンUIはパフォーマンスに悪影響を与えてはならない（MUST）。

#### Scenario: アニメーションのパフォーマンス

**Given** スケルトンUIが表示されている時
**When** アニメーションが実行される
**Then** GPU加速（transform, opacity）のみを使用する
**And** layoutやpaintをトリガーするプロパティ（width, height等）は変更しない

#### Scenario: CLS（Cumulative Layout Shift）の改善

**Given** 作品情報の読み込みが完了する時
**When** スケルトンから実コンテンツに切り替わる
**Then** レイアウトシフトが発生しない（CLS = 0）
**And** コンテンツのサイズがスケルトンと一致する

### Requirement: エラーハンドリング

読み込みエラー時もスケルトンUIを適切に処理しなければならない（MUST）。

#### Scenario: 画像読み込み失敗時

**Given** ポスター画像の読み込みに失敗した時
**Then** スケルトンUIが非表示になる
**And** プレースホルダー画像（"No Image"）が表示される
**And** レイアウトシフトが発生しない

#### Scenario: API通信失敗時

**Given** 作品情報APIの取得に失敗した時
**Then** スケルトンUIが非表示になる
**And** エラーメッセージが表示される
**And** 次の作品への自動遷移が実行される

## CSS実装詳細

### スケルトン基本クラス

```css
.skeleton {
    background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0.08) 0%,
        rgba(255, 255, 255, 0.18) 50%,
        rgba(255, 255, 255, 0.08) 100%
    );
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s ease-in-out infinite;
    border-radius: inherit;
}

@keyframes skeleton-loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}
```

### スケルトンバリエーション

```css
.skeleton-poster {
    width: clamp(160px, 20vw, 240px);
    aspect-ratio: 2 / 3;
    border-radius: 18px;
}

.skeleton-title {
    height: 2rem;
    width: 80%;
    border-radius: 8px;
    margin-bottom: 16px;
}

.skeleton-text {
    height: 1rem;
    border-radius: 4px;
    margin-bottom: 8px;
}

.skeleton-text:last-child {
    width: 60%;
}
```

## JavaScript実装詳細

### スケルトン表示関数

```javascript
/**
 * 作品情報パネルにスケルトンUIを表示する
 */
function displayMovieInfoSkeleton() {
    movieInfoContainer.innerHTML = `
        <div class="skeleton skeleton-poster"></div>
        <div class="movie-details">
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text"></div>
        </div>
    `;
    movieInfoContainer.classList.add('loading');
}
```

### コンテンツ表示関数の更新

```javascript
async function displayMovieInfo(movie) {
    // 画像のpreload
    const posterPath = movie.poster_path
        ? `${IMAGE_BASE_URL}${movie.poster_path}`
        : 'https://via.placeholder.com/200x300.png?text=No+Image';

    const img = new Image();
    img.src = posterPath;
    await img.decode().catch(() => {
        console.warn('画像の読み込みに失敗しました');
    });

    // コンテンツの生成
    const movieGenres = movie.genre_ids.map(id => {
        const genre = state.genres.find(g => g.id === id);
        return genre ? `<span class="genre-tag" data-genre-id="${id}">${genre.name}</span>` : '';
    }).join('');

    // スケルトンからコンテンツへの置き換え
    movieInfoContainer.classList.remove('loading');
    movieInfoContainer.innerHTML = `
        <img src="${posterPath}" alt="${movie.title} のポスター">
        <div class="movie-details">
            <h2>${movie.title}</h2>
            <div class="genres">${movieGenres}</div>
            <p>${movie.overview || 'あらすじはありません。'}</p>
            <div class="info-actions">
                <button id="open-service-button" class="ghost-button">配信サービスで開く</button>
            </div>
        </div>
    `;

    // フェードインアニメーション
    movieInfoContainer.style.animation = 'fadeIn 0.3s ease-out';
}
```

## 関連技術

- CSS `aspect-ratio` プロパティ
- CSS `animation` と `@keyframes`
- JavaScript `Image.decode()` API
- GPU加速アニメーション（transform, opacity）
