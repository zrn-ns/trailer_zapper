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

