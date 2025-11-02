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

