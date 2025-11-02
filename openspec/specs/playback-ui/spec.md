# playback-ui Specification

## Purpose
TBD - created by archiving change refine-playback-ui. Update Purpose after archive.
## Requirements
### Requirement: Edge-to-Edge Video Display

The video player shell SHALL display without rounded corners, creating an edge-to-edge cinema screen appearance.

#### Scenario: Video player displays with square corners
- **GIVEN** the application is running and displaying a trailer
- **WHEN** the user views the video player
- **THEN** the video container has no border-radius (0px)
- **AND** the video fills the available space edge-to-edge within its container

#### Scenario: Fullscreen video displays without border radius
- **GIVEN** the user enters fullscreen mode
- **WHEN** the video player is displayed
- **THEN** the video container maintains zero border-radius
- **AND** no rounded corners are visible at any viewport size

### Requirement: Pure Black Background

The application background SHALL use pure black color without gradients or decorative effects.

#### Scenario: Background displays as solid black
- **GIVEN** the application is running
- **WHEN** the user views the immersive stage
- **THEN** the background is solid black (#000000 or rgb(0, 0, 0))
- **AND** no gradient effects are visible

#### Scenario: Background remains black in fullscreen mode
- **GIVEN** the user enters fullscreen mode
- **WHEN** viewing the application
- **THEN** the background remains solid black
- **AND** no gradients or color variations are present

### Requirement: No Vignette Effect

The video player SHALL NOT display vignette or darkening overlay effects.

#### Scenario: Video displays without artificial darkening
- **GIVEN** a trailer is playing
- **WHEN** the user views the video
- **THEN** no vignette overlay is applied to the video
- **AND** the video displays at its natural brightness throughout

### Requirement: Mouse Movement Shows UI

The UI overlay SHALL automatically appear when the user moves the mouse.

#### Scenario: UI appears on mouse movement after being hidden
- **GIVEN** the UI overlay is currently hidden
- **WHEN** the user moves the mouse anywhere in the viewport
- **THEN** the UI overlay fades in within 200-400ms
- **AND** all UI controls become visible and interactive

#### Scenario: UI remains hidden when mouse is stationary
- **GIVEN** the UI is hidden and the user has not moved the mouse
- **WHEN** the video continues playing
- **THEN** the UI remains hidden
- **AND** only the video content is visible

### Requirement: Automatic UI Hide on Inactivity

The UI overlay SHALL automatically hide after 3 seconds of mouse inactivity.

#### Scenario: UI hides after inactivity timeout
- **GIVEN** the UI overlay is currently visible
- **WHEN** the user stops moving the mouse for 3 seconds
- **AND** the user is not interacting with any UI controls
- **THEN** the UI overlay fades out smoothly
- **AND** only the video content remains visible

#### Scenario: Inactivity timer resets on each mouse movement
- **GIVEN** the UI is visible and the inactivity timer has been running for 2 seconds
- **WHEN** the user moves the mouse
- **THEN** the inactivity timer resets to 0
- **AND** the UI remains visible for another 3 seconds from that movement

### Requirement: UI Persists During Active Interaction

The UI overlay SHALL remain visible while the user actively interacts with controls.

#### Scenario: UI stays visible when hovering over controls
- **GIVEN** the UI overlay is visible
- **WHEN** the user hovers over any button or interactive element
- **THEN** the UI remains visible regardless of inactivity timeout
- **AND** the inactivity timer is paused

#### Scenario: UI stays visible with dropdown open
- **GIVEN** the genre filter dropdown is open
- **WHEN** 3 seconds pass without mouse movement
- **THEN** the UI remains visible
- **AND** the dropdown remains accessible

#### Scenario: Inactivity timer resumes after interaction ends
- **GIVEN** the user was hovering over a control
- **WHEN** the user moves the mouse away from all interactive elements
- **THEN** the inactivity timer starts again
- **AND** the UI will hide after 3 seconds if no further interaction occurs

### Requirement: Manual UI Toggle

The manual UI toggle button SHALL continue to function as a fallback control.

#### Scenario: Manual toggle overrides automatic behavior
- **GIVEN** the automatic UI control is active
- **WHEN** the user clicks the UI toggle button to hide the UI
- **THEN** the UI is manually hidden
- **AND** mouse movement does not show the UI automatically

#### Scenario: Manual toggle can re-enable automatic behavior
- **GIVEN** the UI is manually hidden
- **WHEN** the user clicks the UI toggle button to show the UI
- **THEN** the UI becomes visible
- **AND** automatic mouse-based control is re-enabled

### Requirement: Smooth UI Transitions

UI transitions SHALL be smooth and visually polished.

#### Scenario: UI fades in smoothly
- **GIVEN** the UI is hidden
- **WHEN** the UI appears (via mouse movement or manual toggle)
- **THEN** the opacity transitions from 0 to 1 over 200-400ms
- **AND** the transition uses an easing function for natural movement

#### Scenario: UI fades out smoothly
- **GIVEN** the UI is visible
- **WHEN** the UI hides (via inactivity or manual toggle)
- **THEN** the opacity transitions from 1 to 0 over 300-500ms
- **AND** the transition is smooth without jarring changes

### Requirement: Player Overlay Hides YouTube UI

The player SHALL display an overlay during video loading and ending to hide YouTube branding and UI elements.

#### Scenario: Overlay appears when video is loading
- **GIVEN** a new trailer is being loaded
- **WHEN** the YouTube IFrame begins loading the video
- **THEN** the player overlay is visible with opacity 1
- **AND** the overlay completely covers the player area
- **AND** YouTube title and logo are hidden from view

#### Scenario: Overlay hides during active playback
- **GIVEN** the player overlay is visible during video loading
- **WHEN** the YouTube player state changes to PLAYING
- **THEN** the overlay fades out within 300ms
- **AND** the overlay becomes non-interactive (pointer-events: none)
- **AND** the full video is visible without obstruction

#### Scenario: Overlay reappears when video ends
- **GIVEN** a trailer is currently playing
- **WHEN** the YouTube player state changes to ENDED
- **THEN** the player overlay fades in within 300ms
- **AND** YouTube's related video suggestions are hidden from view

#### Scenario: Overlay maintains z-index above video
- **GIVEN** the player overlay is visible
- **WHEN** viewing the player area
- **THEN** the overlay has z-index 10
- **AND** the overlay appears above the YouTube IFrame (z-index 1)
- **AND** the overlay is below UI controls (z-index 2+)

### Requirement: Film Grain Visual Effect

The player overlay SHALL display a subtle film grain effect to enhance cinematic immersion.

#### Scenario: Film grain is visible on overlay
- **GIVEN** the player overlay is visible
- **WHEN** the user views the overlay
- **THEN** a subtle film grain texture is visible
- **AND** the grain opacity is approximately 0.4
- **AND** the grain does not obscure the video when overlay is hidden

#### Scenario: Film grain animates smoothly
- **GIVEN** the film grain effect is active
- **WHEN** the overlay is displayed
- **THEN** the grain animates in subtle steps (0.2s cycle)
- **AND** the animation uses GPU acceleration for performance
- **AND** the effect runs continuously while overlay is visible

#### Scenario: Film grain uses CSS gradients
- **GIVEN** the film grain implementation
- **WHEN** rendering the visual effect
- **THEN** the grain uses repeating-linear-gradient patterns
- **AND** multiple gradient layers create varied texture
- **AND** no external image assets are required

#### Scenario: Film grain is non-interactive
- **GIVEN** the film grain effect is displayed
- **WHEN** the user attempts to interact with the overlay
- **THEN** the grain element has pointer-events: none
- **AND** interactions pass through to underlying elements as appropriate

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

