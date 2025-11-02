# Spec: Startup Experience (iOS Safari Autoplay Fix)

## MODIFIED Requirements

### Requirement: User-Triggered Transition to Playback

The application SHALL transition to video playback mode when the user clicks the start button, maintaining compliance with YouTube API autoplay policies across all platforms including iOS Safari. The system MUST handle iOS Safari's strict autoplay policy by initializing the player within the user gesture context.

#### Scenario: iOS Safari detects user gesture and enables autoplay

**Given** the user is using iOS Safari (iPhone, iPad, or iPod)
**And** the startup modal is displayed
**When** the user clicks anywhere on the modal or the start button
**Then** the system detects iOS Safari using User Agent
**And** immediately initializes a YouTube player with a dummy video within the user gesture context
**And** the dummy player starts playback to maintain the gesture context
**And** after the dimming animation and API calls complete, the player switches to the actual trailer video
**And** the trailer begins playing automatically

#### Scenario: Non-iOS browsers continue with existing behavior

**Given** the user is not using iOS Safari (macOS Safari, Chrome, Firefox, etc.)
**And** the startup modal is displayed
**When** the user clicks the start button
**Then** the page transitions to complete darkness over 0.5 seconds
**And** the modal disappears with a fade-out effect
**And** the video player becomes active and begins loading content after the animation
**And** audio is enabled for playback

#### Scenario: iOS Safari player initialization preserves user gesture

**Given** iOS Safari has been detected
**And** the user has clicked to start
**When** the system initializes the YouTube IFrame Player API
**Then** the player is created synchronously within the click handler (no setTimeout/Promise delay before initialization)
**And** a dummy video begins playing immediately
**And** the user gesture context is preserved throughout the initialization
**And** subsequent `loadVideoById()` calls work without additional user interaction
