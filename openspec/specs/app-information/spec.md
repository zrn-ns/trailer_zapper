# app-information Specification

## Purpose
TBD - created by archiving change add-about-modal. Update Purpose after archive.
## Requirements
### Requirement: 情報モーダルの表示

The application SHALL provide an information modal that includes license information, author information, source code links, and data provider attributions.

#### Scenario: 情報ボタンからモーダルを開く

- **GIVEN** ユーザーがメイン画面を表示している
- **WHEN** ユーザーが情報ボタンをクリックする
- **THEN** 情報モーダルが画面中央に表示される
- **AND** モーダルの背景にはバックドロップが表示される
- **AND** モーダルの背後のコンテンツは操作できない

#### Scenario: 情報モーダルの内容

- **GIVEN** 情報モーダルが表示されている
- **WHEN** ユーザーがモーダルの内容を確認する
- **THEN** TMDBのロゴとデータ提供表記が表示されている
- **AND** OtoLogic音声ライセンス (CC BY 4.0) とリンクが表示されている
- **AND** 作者情報が表示されている
- **AND** ソースコードへのリンク（GitHub）が表示されている
- **AND** すべてのリンクはクリック可能で、新しいタブで開かれる

#### Scenario: 閉じるボタンでモーダルを閉じる

- **GIVEN** 情報モーダルが表示されている
- **WHEN** ユーザーがモーダルヘッダーの閉じるボタン（×）をクリックする
- **THEN** 情報モーダルが非表示になる
- **AND** バックドロップも非表示になる
- **AND** メイン画面のコンテンツが再び操作可能になる

#### Scenario: バックドロップクリックでモーダルを閉じる

- **GIVEN** 情報モーダルが表示されている
- **WHEN** ユーザーがバックドロップ（モーダル外の暗い領域）をクリックする
- **THEN** 情報モーダルが非表示になる
- **AND** バックドロップも非表示になる

#### Scenario: Escキーでモーダルを閉じる

- **GIVEN** 情報モーダルが表示されている
- **WHEN** ユーザーがEscキーを押す
- **THEN** 情報モーダルが非表示になる
- **AND** バックドロップも非表示になる

#### Scenario: モバイルデバイスでの表示

- **GIVEN** ユーザーがモバイルデバイスで情報モーダルを開く
- **WHEN** モーダルが表示される
- **THEN** モーダルは画面サイズに適応して表示される
- **AND** コンテンツが多い場合はスクロール可能である
- **AND** すべてのリンクとボタンがタップ可能である

### Requirement: 既存ライセンス表記の削除

The TMDB and OtoLogic license attributions previously placed at the bottom of the UI SHALL be removed as they are migrated to the information modal.

#### Scenario: UI下部のライセンス表記が削除される

- **GIVEN** 情報モーダル機能が実装されている
- **WHEN** ユーザーがメイン画面を表示する
- **THEN** UI下部に`.tmdb-attribution`が表示されない
- **AND** UI下部に`.audio-attribution`が表示されない
- **AND** これらの情報は情報モーダル内でのみ表示される

### Requirement: サービス説明文（キャッチフレーズ）の表示

The application SHALL display a consistent service catchphrase that conveys the immersive cinema experience and the value of discovering new films across all user touchpoints.

#### Scenario: メタタグでのキャッチフレーズ表示

- **GIVEN** ユーザーがページを訪問する
- **WHEN** ブラウザがHTMLのメタタグを読み込む
- **THEN** meta description タグに「映画館のような没入感で、まだ見ぬ傑作と出会おう。」が設定されている
- **AND** OGP descriptionタグに同じキャッチフレーズが設定されている
- **AND** Twitter Card descriptionタグに同じキャッチフレーズが設定されている

#### Scenario: スタートモーダルでのキャッチフレーズ表示

- **GIVEN** ユーザーが初めてアプリケーションを開く
- **WHEN** スタートモーダルが表示される
- **THEN** ウェルカムメッセージとして「映画館のような没入感で、まだ見ぬ傑作と出会おう。」が表示される
- **AND** テキストは読みやすく、視認性が高い

#### Scenario: 情報モーダルでのキャッチフレーズ表示

- **GIVEN** ユーザーが情報ボタンをクリックして情報モーダルを開く
- **WHEN** モーダルのアプリケーション説明セクションを確認する
- **THEN** アプリ名「Trailer Zapper」の下に「映画館のような没入感で、まだ見ぬ傑作と出会おう。」が表示される
- **AND** 他のセクション（ライセンス情報等）と視覚的に区別されている

#### Scenario: SNSシェア時の表示

- **GIVEN** ユーザーがアプリケーションのURLをSNSでシェアする
- **WHEN** SNSプラットフォーム（Twitter、Facebook等）がOGPタグを読み込む
- **THEN** シェアプレビューにキャッチフレーズ「映画館のような没入感で、まだ見ぬ傑作と出会おう。」が表示される
- **AND** サービスの価値が明確に伝わる

#### Scenario: 検索エンジン結果での表示

- **GIVEN** ユーザーが検索エンジンでアプリケーションを検索する
- **WHEN** 検索結果ページにアプリケーションが表示される
- **THEN** スニペットとしてキャッチフレーズ「映画館のような没入感で、まだ見ぬ傑作と出会おう。」が表示される
- **AND** ユーザーがクリックしたくなる魅力的な説明になっている

