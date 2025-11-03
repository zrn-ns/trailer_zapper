# startup-experience Specification

## Purpose
TBD - created by archiving change add-cinematic-startup-animation. Update Purpose after archive.
## Requirements
### Requirement: Gradual Dimming Animation

The application SHALL display a gradual dimming animation when the page loads, simulating the experience of theater lights gradually turning down before a movie begins.

#### Scenario: Initial page load with normal brightness

- **WHEN** the user first loads the application page
- **THEN** the page displays with normal brightness for a brief moment (< 0.1s)
- **AND** a dark overlay gradually appears over approximately 1.5 seconds

#### Scenario: Dimming animation completes

- **WHEN** the dimming animation completes
- **THEN** the background is darkened to simulate a theater environment
- **AND** the startup modal remains clearly visible and readable
- **AND** the "Start" button is prominent and ready for user interaction

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

### Requirement: Performance Optimization

The dimming animation SHALL be implemented using GPU-accelerated CSS properties to ensure smooth performance across devices.

#### Scenario: Animation uses GPU acceleration

- **WHEN** the dimming animation runs
- **THEN** only GPU-accelerated properties are animated (opacity, transform)
- **AND** no layout-triggering properties are animated (width, height, margin, padding)
- **AND** the animation runs at 60fps on modern devices

#### Scenario: Low-end device performance

- **WHEN** running on a lower-end device
- **THEN** the animation still completes smoothly without janking
- **AND** the page remains responsive to user interaction during animation

### Requirement: Accessibility - Reduced Motion Support

The application SHALL respect the user's `prefers-reduced-motion` system preference by disabling animations when requested.

#### Scenario: User has reduced motion preference enabled

- **WHEN** the user's system has `prefers-reduced-motion: reduce` set
- **THEN** the dimming animation is skipped
- **AND** the page displays in the dimmed state immediately
- **AND** the startup modal is visible without animation
- **AND** clicking the start button results in an instant transition to playback

### Requirement: Animation Timing

The startup animation sequence SHALL complete within a reasonable timeframe to avoid user frustration.

#### Scenario: Total animation duration

- **WHEN** the page loads without user interaction
- **THEN** the auto-playing dimming animation completes within 2.5 seconds
- **AND** the start button is immediately available for interaction

#### Scenario: User-triggered transition timing

- **WHEN** the user clicks the start button
- **THEN** the transition to playback mode completes within 0.5 seconds
- **AND** feels responsive to the user's action

### Requirement: Smooth Easing Functions

The animations SHALL use appropriate easing functions to create a natural, theatrical feel.

#### Scenario: Dimming animation easing

- **WHEN** the gradual dimming animation plays
- **THEN** it uses an ease-out timing function
- **AND** the animation starts quickly and slows down gradually
- **AND** creates a natural lighting-down effect

#### Scenario: Final fade easing

- **WHEN** transitioning to playback after button click
- **THEN** it uses an ease-in timing function
- **AND** the fade accelerates into complete darkness
- **AND** feels immediate and responsive

### Requirement: Startup Buzzer Sound

The application SHALL play a distinctive buzzer sound when the user initiates the startup sequence, synchronized with the dimming animation to create an authentic theater experience.

#### Scenario: Buzzer sound plays on start button click

- **GIVEN** the startup modal is displayed
- **WHEN** the user clicks the "上映開始" button
- **THEN** a buzzer sound begins playing immediately
- **AND** the sound plays simultaneously with the dimming animation
- **AND** the buzzer audio completes naturally without looping

#### Scenario: Audio timing synchronized with animation

- **GIVEN** the user has clicked the start button
- **WHEN** the dimming animation begins at time T
- **THEN** the buzzer sound also starts at time T
- **AND** both audio and visual effects create a cohesive experience
- **AND** the audio does not lag or start before the animation

#### Scenario: Buzzer sound respects user audio settings

- **GIVEN** the user has clicked the start button
- **WHEN** the buzzer sound plays
- **THEN** it respects the system/browser volume settings
- **AND** it does not play if the user has muted the browser tab
- **AND** audio playback failures (if any) do not block the visual animation

#### Scenario: Single playback per session

- **GIVEN** the buzzer sound has played once
- **WHEN** the user experiences the startup sequence
- **THEN** the buzzer sound plays exactly once per page load
- **AND** does not repeat or loop
- **AND** completes its full duration

#### Scenario: Audio file loading

- **GIVEN** the application is loading
- **WHEN** the page initializes
- **THEN** the buzzer audio file is preloaded
- **AND** is ready to play instantly when the start button is clicked
- **AND** playback is not delayed by network loading

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

