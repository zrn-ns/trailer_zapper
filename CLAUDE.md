# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 開発環境セットアップ

このプロジェクトはシンプルな静的Webアプリケーションで、Node.jsやビルドツールは不要です。

### 開発サーバーの起動
```bash
# Python 3を使用したローカルサーバー
python3 -m http.server 8000

# またはPHPを使用
php -S localhost:8000

# VSCodeのLive Server拡張機能も推奨
```

### 環境変数の設定
TMDB APIキーは`.env`ファイルに保存されていますが、現在はJavaScriptに直接ハードコードされています（script.js:9）。

## アーキテクチャ概要

### ファイル構成
- `index.html`: UIレイアウトとコンポーネント定義
- `script.js`: すべてのアプリケーションロジック（約700行）
- `style.css`: シネマティックなビジュアルデザイン

### 主要な状態管理（script.js:52-69）
```javascript
const state = {
    movies: [],              // 現在の映画リスト
    history: [],             // 視聴履歴（インデックスの配列）
    currentMovieIndex: 0,    // 現在表示中の映画のインデックス
    selectedProviders: [],   // 選択された配信サービス
    ignoredMovies: Set(),    // 興味なしマークされた映画ID
    selectedGenres: Set(),   // 選択されたジャンルID（ホワイトリスト）
    youtubePlayer: null,     // YouTube IFrame Playerインスタンス
    processedMovies: Set(),  // 処理済み映画ID（再表示防止）
}
```

### 主要なフロー

1. **初期化フロー** (`initializeApp`: script.js:606-719)
   - localStorageから設定を復元
   - TMDBからジャンルリストを取得
   - スタートモーダルを表示
   - ユーザーが開始ボタンを押すと映画取得開始

2. **映画取得フロー** (`updateAndFetchMovies`: script.js:482-569)
   - 選択された配信サービスとジャンルでTMDB APIを呼び出し
   - 興味なし/処理済み映画をフィルタリング
   - 結果がない場合は次のページを自動取得

3. **予告編再生フロー** (`loadAndDisplayTrailer`: script.js:422-480)
   - 現在の映画の予告編をTMDBから検索
   - YouTube IFrame APIでプレーヤーを作成・再生
   - 予告編がない場合は自動的に次の映画へ

4. **ナビゲーション管理**
   - `playNext`/`playPrev`: 履歴を考慮したナビゲーション
   - 最後の映画に達したら次のページを自動ロード

### UI制御の特徴

- **二層構造**: ビデオレイヤー（z-index: 1）とUIレイヤー（z-index: 2）
- **UI表示/非表示**: 手動切り替えとタイムアウトによる自動非表示
- **フルスクリーン対応**: immersive-stageコンテナ全体をフルスクリーン化
- **キーボードショートカット**:
  - スペース: 一時停止/再生
  - N/P: 次/前の予告編
  - F: フルスクリーン切り替え
  - H: UI表示/非表示
  - Enter: 配信サービスで開く

### ユーザーデータの永続化（localStorage）

- `selectedProviders`: 選択された配信サービス
- `ignoredMovies`: 興味なしリスト
- `processedMovies`: 視聴済み映画（再表示防止）
- `selectedGenres`: 選択されたジャンル（ホワイトリスト方式）

## デバッグのヒント

### 主要なデバッグポイント
- YouTube Player API関連: `displayTrailer`関数 (script.js:130-171)
- TMDB API通信: `fetchFromTMDB`関数 (script.js:26-49)
- 映画フィルタリング: `updateAndFetchMovies`内のフィルタ処理 (script.js:541-544)

### よくある問題と対処

1. **予告編が再生されない**
   - ブラウザのコンソールでYouTube Player APIエラーを確認
   - `handleYoutubeError` (script.js:234-237)にブレークポイント設定

2. **映画リストが空**
   - TMDB APIレスポンスを確認（script.js:530-537）
   - 選択された配信サービスとジャンルの組み合わせを確認

3. **UI表示/非表示の不具合**
   - `isManuallyHidden`と`isUIVisible`の状態を確認（script.js:393-394）
   - イベントハンドラの競合をチェック

## 注意事項

- APIキーは現在クライアントサイドに露出している（プロトタイプ用）
- プロダクション環境では、APIキーはサーバーサイドで管理すべき
- YouTube自動再生はブラウザのポリシーにより初回はミュート状態