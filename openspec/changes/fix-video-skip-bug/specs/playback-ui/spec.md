# playback-ui Spec Delta

## NEW Requirements

### Requirement: YouTube動画エラー処理

The application SHALL handle YouTube player errors gracefully without causing rapid consecutive video skips.

#### Scenario: エラー発生時の連続スキップ防止

- **GIVEN** 動画が再生中である
- **WHEN** YouTubeエラーが発生する
- **THEN** 最後のスキップから3秒以内の場合は自動スキップしない
- **AND** 3秒経過後にエラーが継続している場合のみスキップする
- **AND** コンソールに警告ログが出力される

#### Scenario: エラーコードに応じた適切な処理

- **GIVEN** YouTubeエラーが発生した
- **WHEN** エラーコードが2または5（一時的なエラー）の場合
- **THEN** 1回リトライを試みる
- **AND** リトライが成功した場合は再生を継続する
- **AND** リトライが失敗した場合のみ次の動画にスキップする

#### Scenario: 致命的なエラーの即時スキップ

- **GIVEN** YouTubeエラーが発生した
- **WHEN** エラーコードが100, 101, 150（動画が利用不可）の場合
- **THEN** リトライせずに次の動画にスキップする
- **AND** エラー詳細がコンソールに記録される

#### Scenario: エラーログの詳細化

- **GIVEN** YouTubeエラーが発生した
- **WHEN** エラーが処理される
- **THEN** コンソールにエラーコード、タイムスタンプ、動画IDが記録される
- **AND** エラーの種類（一時的/致命的）が識別される
- **AND** 取られたアクション（リトライ/スキップ）が記録される
