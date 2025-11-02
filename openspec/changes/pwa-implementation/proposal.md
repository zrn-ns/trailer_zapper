# Proposal: PWA Implementation

## Status
Draft

## Problem Statement

現在、Trailer Zapperはブラウザで表示する際にブラウザUI（アドレスバー、ツールバー、タブバー等）が表示されてしまい、特にモバイルデバイスの横画面での没入型体験が損なわれています。また、iOS Safariでは標準のFullscreen APIが動作せず、全画面ボタンが機能しません。

ユーザーがアプリケーションをホーム画面に追加してスタンドアロンモードで起動できるようにすることで、以下の問題を解決できます：

1. **ブラウザUIの排除**: スタンドアロンモードではブラウザのUIが完全に消え、真の全画面体験が可能
2. **iOS Safari全画面問題の解決**: standaloneモードではブラウザUIがないため、全画面ボタン自体が不要
3. **アプリライクな体験**: ネイティブアプリのような起動と使用感
4. **オフライン対応**: Service Workerによるキャッシングで、オフラインでもアセットを利用可能

## Proposed Solution

Progressive Web App (PWA) 機能を実装し、以下を提供します：

1. **Web App Manifest**: アプリケーションのメタデータ、アイコン、display modeを定義
2. **インストール促進バナー**: ユーザーにホーム画面追加を促すUI
3. **Service Worker**: アセットのキャッシングとオフライン対応
4. **スタンドアロンモード検出**: standaloneモードで起動している場合は全画面ボタンを非表示

## Scope

### In Scope
- Web App Manifestの作成（manifest.json）
- 複数サイズのアプリアイコンの準備
- インストール促進バナーのUI実装
- Service Workerによるアセットキャッシング
- スタンドアロンモード検出と全画面ボタンの制御
- manifestへのリンク追加（index.html）

### Out of Scope
- プッシュ通知機能
- バックグラウンド同期
- オフラインでのTMDB API呼び出し対応（APIはオンライン前提）
- App Storeへの公開

## Success Criteria

1. ユーザーがブラウザの「ホーム画面に追加」からアプリをインストールできる
2. インストールバナーが適切なタイミングで表示される
3. スタンドアロンモードで起動した場合、ブラウザUIが完全に消える
4. スタンドアロンモード時は全画面ボタンが非表示になる
5. Service Workerがアセットをキャッシュし、2回目以降の起動が高速化される
6. 既存のデスクトップブラウザでの動作に影響がない

## Dependencies
- 既存のmobile-ui spec（スタンドアロン検出と全画面ボタン制御を追加）
- 既存のstartup-experience spec（インストールバナーとの共存）

## Rollout Plan

### Phase 1: Manifest and Icons
- manifest.jsonの作成
- アイコン画像の準備
- HTMLへのmanifestリンク追加

### Phase 2: Service Worker
- Service Workerの実装
- キャッシュ戦略の定義
- 登録処理の追加

### Phase 3: Install Prompt
- インストールバナーUIの実装
- beforeinstallpromptイベントのハンドリング
- インストール状態の管理

### Phase 4: Standalone Detection
- スタンドアロンモード検出ロジック
- 全画面ボタンの条件付き非表示
- iOS Safari対応の確認

## Related Changes
- fix-ios-safari-autoplay（iOS Safari対応の文脈で関連）
- mobile-ui spec（全画面ボタンの動作に影響）

## Open Questions
なし
