# Change Genre Filter to OR

## Why

現在のジャンルフィルターはAND条件（すべてのジャンルを含む映画のみ表示）で動作しているため、複数のジャンルを選択すると結果が極端に絞り込まれてしまいます。ユーザーが期待するのは、選択したジャンルのいずれかに該当する映画を幅広く発見できることです。OR条件に変更することで、より柔軟で直感的な絞り込み体験を提供します。

## What Changes

- TMDB APIへのジャンルパラメータをカンマ区切り（AND条件）からパイプ区切り（OR条件）に変更
- ジャンルフィルターモーダルの説明文を更新してOR条件であることを明示

## Impact

- **Affected specs:**
  - `movie-filtering` - MODIFIED: ジャンルフィルターの動作をOR条件に変更

- **Affected code:**
  - `client/script.js` - `updateAndFetchMovies()`関数内のジャンルパラメータ生成ロジックを変更（カンマ→パイプ）
  - `client/script.js` - `populateGenreFilterUI()`関数内の説明文を更新

- **User impact:**
  - 複数ジャンル選択時により多くの映画が表示されるようになる
  - より直感的な絞り込み体験を提供
  - 既存のlocalStorage設定には影響なし（後方互換性あり）
