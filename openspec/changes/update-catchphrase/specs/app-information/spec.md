# app-information Spec Delta

## ADDED Requirements

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
