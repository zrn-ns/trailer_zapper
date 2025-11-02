# Implementation Tasks

## Task 1: 既存のライセンス表記を削除
- [ ] `client/index.html`から`.tmdb-attribution`と`.audio-attribution`のHTMLを削除
- [ ] `client/style.css`から`.tmdb-attribution`と`.audio-attribution`のスタイルを削除
- **Verification**: 既存のライセンス表記が画面から消えていること

## Task 2: 情報ボタンをUIに追加
- [ ] `client/index.html`のUI上部（ヘッダー付近）に情報ボタンを追加
- [ ] ボタンに適切なアイコンまたはテキスト（「情報」「ⓘ」など）を配置
- [ ] `client/style.css`に情報ボタンのスタイルを追加
- **Verification**: 情報ボタンが表示されること

## Task 3: 情報モーダルのHTMLを作成
- [ ] `client/index.html`に情報モーダルのマークアップを追加
- [ ] モーダル内に以下のセクションを配置:
  - TMDBロゴとデータ提供表記
  - OtoLogic音声ライセンス (CC BY 4.0) とリンク
  - 作者情報
  - ソースコードリンク（GitHub）
- [ ] モーダルヘッダーに閉じるボタンを配置
- [ ] バックドロップ要素を追加
- **Verification**: モーダルのHTMLが正しく構造化されていること

## Task 4: 情報モーダルのスタイルを実装
- [ ] `client/style.css`に情報モーダルのスタイルを追加
- [ ] 既存の`.genre-filter-modal`と統一感のあるデザインにする
- [ ] モバイル対応のレスポンシブスタイルを追加
- [ ] スクロール可能なコンテンツエリアを実装
- **Verification**: モーダルが視覚的に適切に表示されること

## Task 5: モーダル開閉ロジックを実装
- [ ] `client/script.js`に情報ボタンクリック時のモーダル表示ロジックを追加
- [ ] 閉じるボタンクリック時のモーダル非表示ロジックを追加
- [ ] バックドロップクリック時のモーダル非表示ロジックを追加
- [ ] モーダル表示時のキーボード操作（Escキー）対応を追加
- **Verification**: モーダルが正しく開閉できること

## Task 6: クロスブラウザ・デバイステスト
- [ ] デスクトップブラウザ（Chrome、Firefox、Safari）でテスト
- [ ] モバイルデバイス（iOS、Android）でテスト
- [ ] モーダル内のリンクが正しく機能することを確認
- [ ] レスポンシブデザインが適切に動作することを確認
- **Verification**: すべての環境で情報モーダルが正常に動作すること

## Dependencies
- Task 1は独立して実行可能
- Task 2-5は並行して実装可能だが、統合前に各タスクを完了すること
- Task 6はTask 1-5が完了してから実行
