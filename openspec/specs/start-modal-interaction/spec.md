# start-modal-interaction Specification

## Purpose
TBD - created by archiving change clickable-start-modal. Update Purpose after archive.
## Requirements
### Requirement: 画面全体クリックで上映開始

上映開始画面全体をクリック可能にし、ユーザーが直感的に上映を開始できるようにする。システムはMUSTとして、上映開始画面（`#start-modal`）全体がクリックされた際に上映開始処理を実行しなければならない。ただし、フルスクリーンボタンをクリックした場合は上映開始処理を実行しない。

#### Scenario: ユーザーが画面をクリックした場合

**Given** 上映開始画面（start-modal）が表示されている
**When** ユーザーが上映開始画面のどこかをクリックする（ボタン以外）
**Then** 上映が開始される
**And** ブザー音が再生される
**And** 暗転演出が実行される
**And** アプリケーションが起動する

#### Scenario: ユーザーが「上映開始」ボタンをクリックした場合（既存動作の維持）

**Given** 上映開始画面（start-modal）が表示されている
**When** ユーザーが「上映開始」ボタンをクリックする
**Then** 上映が開始される
**And** ブザー音が再生される
**And** 暗転演出が実行される
**And** アプリケーションが起動する

#### Scenario: ユーザーがフルスクリーンボタンをクリックした場合（新規動作）

**Given** 上映開始画面（start-modal）が表示されている
**When** ユーザーがフルスクリーンボタンをクリックする
**Then** フルスクリーンモードが有効化される
**And** 上映開始処理は実行されない
**And** モーダルはそのまま表示される
**And** ユーザーは引き続き「上映開始」ボタンをクリックできる

#### Scenario: ユーザーがキーボードショートカットを使用した場合（既存動作の維持）

**Given** 上映開始画面（start-modal）が表示されている
**And** 入力フィールドにフォーカスしていない
**When** ユーザーがSpaceキーまたはEnterキーを押す
**Then** 上映が開始される
**And** ブザー音が再生される
**And** 暗転演出が実行される
**And** アプリケーションが起動する

### Requirement: 重複クリック防止

上映開始処理が実行中の場合、追加のクリックを無視して処理が複数回実行されないようにする。システムはMUSTとして、上映開始処理が実行中の場合は追加のクリックを無視しなければならない。

#### Scenario: 上映開始処理中にユーザーが再度クリックした場合

**Given** ユーザーが一度モーダルコンテンツ領域またはボタンをクリックした
**And** 上映開始処理が実行中である
**When** ユーザーが再度モーダルコンテンツ領域またはボタンをクリックする
**Then** 2回目のクリックは無視される
**And** 上映開始処理は1回のみ実行される

### Requirement: イベント伝播制御

ボタンをクリックした際に、親要素のクリックイベントも発火しないようにイベント伝播を制御する。システムはMUSTとして、ボタン（「上映開始」ボタンまたはフルスクリーンボタン）のクリックイベントが発火した際はイベント伝播を停止し、親要素のクリックイベントを発火させてはならない。

#### Scenario: ボタンクリック時のイベント伝播

**Given** 上映開始画面（start-modal）が表示されている
**When** ユーザーが「上映開始」ボタンまたはフルスクリーンボタンをクリックする
**Then** クリックされたボタンのイベントのみが処理される
**And** モーダル全体のクリックイベントは処理されない（イベント伝播を停止）
**And** 各ボタンの意図した動作のみが実行される

### Requirement: Fullscreen Button Click Handling

The system SHALL provide a fullscreen button in the startup modal that allows users to enter fullscreen mode before starting playback.

#### Scenario: User clicks fullscreen button

- **GIVEN** the startup modal is displayed
- **WHEN** the user clicks the fullscreen button
- **THEN** the application requests fullscreen mode for the immersive stage container
- **AND** the startup modal remains visible in fullscreen
- **AND** no playback starts (only fullscreen mode is activated)
- **AND** the user can proceed to click the start button when ready

#### Scenario: Fullscreen button clicked when already in fullscreen

- **GIVEN** the startup modal is displayed
- **AND** the application is already in fullscreen mode
- **WHEN** the user clicks the fullscreen button
- **THEN** the application remains in fullscreen mode
- **AND** no error is thrown
- **AND** the user experience is not disrupted

#### Scenario: Browser does not support fullscreen

- **GIVEN** the user's browser does not support the Fullscreen API
- **AND** the startup modal is displayed
- **WHEN** the user clicks the fullscreen button
- **THEN** a helpful message is logged or displayed (implementation-dependent)
- **AND** the button click does not cause errors
- **AND** the modal remains functional for starting playback

#### Scenario: Fullscreen button event propagation

- **GIVEN** the startup modal is displayed
- **WHEN** the user clicks the fullscreen button
- **THEN** the fullscreen button's click event does not trigger the modal's click-to-start behavior
- **AND** event propagation is stopped appropriately
- **AND** only fullscreen activation occurs, not playback start

