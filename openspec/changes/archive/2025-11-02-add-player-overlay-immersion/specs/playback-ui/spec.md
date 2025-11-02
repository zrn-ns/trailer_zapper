# playback-ui Spec Delta

## ADDED Requirements

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
