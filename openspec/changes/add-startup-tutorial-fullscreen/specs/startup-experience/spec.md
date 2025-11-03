# startup-experience Specification Deltas

## ADDED Requirements

### Requirement: Startup Modal Tutorial Content

The startup modal SHALL display brief tutorial content to guide users and establish a cinematic movie-watching atmosphere before playback begins.

#### Scenario: Tutorial content is displayed on page load

- **WHEN** the user first loads the application page
- **THEN** the startup modal displays a cinematic welcome message
- **AND** the modal includes a brief description of the app's purpose
- **AND** keyboard shortcuts are displayed in a concise, readable format
- **AND** a recommendation message encourages fullscreen viewing for optimal experience
- **AND** all tutorial content maintains the theatrical aesthetic

#### Scenario: Tutorial content readability

- **WHEN** the startup modal is visible during the dimming animation
- **THEN** all tutorial text remains clearly readable
- **AND** the text contrast is sufficient for easy reading
- **AND** the layout is organized and not overwhelming
- **AND** the content does not obscure the start button or other interactive elements

#### Scenario: Mobile responsiveness of tutorial content

- **WHEN** the startup modal is viewed on a mobile device
- **THEN** the tutorial content is appropriately sized for the screen
- **AND** all text and buttons remain accessible without horizontal scrolling
- **AND** the keyboard shortcuts section adapts for touch-based interaction hints

### Requirement: Fullscreen Button in Startup Modal

The startup modal SHALL include a fullscreen button that allows users to enter fullscreen mode before starting playback, enhancing the immersive experience.

#### Scenario: Fullscreen button is visible in modal

- **WHEN** the startup modal is displayed
- **THEN** a fullscreen button is visible near the start button
- **AND** the button is clearly labeled (e.g., "全画面で観る" or similar)
- **AND** the button uses appropriate iconography (e.g., fullscreen icon)
- **AND** the button styling matches the existing theatrical design aesthetic

#### Scenario: User clicks fullscreen button

- **WHEN** the user clicks the fullscreen button in the startup modal
- **THEN** the application enters fullscreen mode immediately
- **AND** the startup modal remains visible in fullscreen
- **AND** the user can then click the start button to begin playback
- **AND** no errors occur if fullscreen is already active

#### Scenario: Fullscreen API not supported

- **WHEN** the user's browser does not support the Fullscreen API
- **THEN** the fullscreen button is either hidden or disabled
- **OR** clicking the button displays a helpful message explaining the limitation
- **AND** the user can still start playback normally without fullscreen
- **AND** the application remains functional

#### Scenario: User enters fullscreen then starts playback

- **WHEN** the user clicks the fullscreen button
- **AND** then clicks the start button
- **THEN** the playback begins in fullscreen mode
- **AND** the buzzer sound plays as expected
- **AND** the dimming animation completes normally
- **AND** the video player activates in fullscreen

## MODIFIED Requirements

### Requirement: Startup Modal Visibility

The startup modal SHALL remain visible and legible throughout the dimming animation, ensuring users can read the tutorial content and interact with both the start button and the fullscreen button.

#### Scenario: Modal visibility during animation

- **WHEN** the dimming animation is in progress
- **THEN** the modal content remains at full opacity
- **AND** the modal is positioned prominently in the center of the screen
- **AND** all text, tutorial content, and buttons are clearly readable
- **AND** the fullscreen button is easily accessible

### Requirement: User-Triggered Transition to Playback

The application SHALL transition to video playback mode only when the user clicks the start button, maintaining compliance with YouTube API autoplay policies. The user may optionally enter fullscreen mode before starting playback.

#### Scenario: User clicks start button

- **WHEN** the user clicks the "開始する" (Start) button
- **THEN** the page transitions to complete darkness over 0.5 seconds
- **AND** the modal disappears with a fade-out effect
- **AND** the video player becomes active and begins loading content
- **AND** audio is enabled for playback (complying with user interaction requirement)
- **AND** if already in fullscreen, playback starts in fullscreen mode

#### Scenario: User clicks start button without entering fullscreen

- **WHEN** the user clicks the start button without clicking the fullscreen button
- **THEN** the same transition occurs as before
- **AND** playback begins in normal (non-fullscreen) mode
- **AND** the user can still enter fullscreen later using the existing fullscreen button in the UI

#### Scenario: Keyboard interaction with start button

- **WHEN** the startup modal is displayed
- **AND** the user presses Space or Enter key
- **THEN** the same transition occurs as clicking the button
- **AND** the keyboard shortcut bypasses the fullscreen button (for quick start)
