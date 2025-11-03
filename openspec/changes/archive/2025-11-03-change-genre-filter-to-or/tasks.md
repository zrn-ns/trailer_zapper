# Tasks for change-genre-filter-to-or

## Phase 1: API Parameter Change

- [ ] script.jsのupdateAndFetchMovies()関数を修正
  - `with_genres`パラメータの生成ロジックを変更
  - カンマ区切り（`,`）からパイプ区切り（`|`）に変更
  - 変更箇所: `Array.from(state.selectedGenres).join(',')` → `Array.from(state.selectedGenres).join('|')`
  - **Validation**: 複数ジャンル選択時にAPIリクエストのURLにパイプ区切りが含まれることを確認

## Phase 2: UI説明文の更新

- [ ] ジャンルフィルターモーダルの説明文を更新
  - populateGenreFilterUI()関数内の説明文を変更
  - 現在: "チェックを入れたジャンルのみ表示されます。"
  - 変更後: "チェックを入れたジャンルのいずれかに該当する映画が表示されます。"
  - **Validation**: ジャンルフィルターモーダルを開いて説明文が更新されていることを確認

## Phase 3: Testing

- [ ] 単一ジャンル選択のテスト
  - 1つのジャンルを選択して適用
  - そのジャンルの映画が表示されることを確認
  - **Validation**: 正常に動作する

- [ ] 複数ジャンル選択のテスト（OR条件）
  - 2つ以上のジャンルを選択して適用
  - 選択したジャンルのいずれかに該当する映画が表示されることを確認
  - 以前（AND条件）よりも多くの映画が表示されることを確認
  - **Validation**: OR条件で正常に動作する

- [ ] ジャンル未選択のテスト
  - すべてのジャンルのチェックを外して適用
  - すべての映画が表示されることを確認（ジャンルフィルターが適用されない）
  - **Validation**: 正常に動作する

- [ ] 後方互換性のテスト
  - 既存のlocalStorage設定が正常に読み込まれることを確認
  - **Validation**: 既存設定に影響なし
