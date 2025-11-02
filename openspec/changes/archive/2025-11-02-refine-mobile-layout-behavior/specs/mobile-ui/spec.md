# mobile-ui Spec Delta

## ADDED Requirements

### Requirement: Portrait Mode Persistent UI

The UI overlay SHALL remain permanently visible in portrait mode (viewport width ≤720px).

#### Scenario: UI always visible in portrait mode
- **GIVEN** the viewport width is 720px or less
- **WHEN** the application is running
- **THEN** the UI overlay remains visible at all times
- **AND** the UI does not auto-hide after inactivity
- **AND** the UI cannot be manually hidden

#### Scenario: UI auto-hide disabled in portrait
- **GIVEN** the viewport width is 720px or less
- **WHEN** 3 seconds pass without user interaction
- **THEN** the UI remains visible
- **AND** the inactivity timeout does not trigger hiding

#### Scenario: UI toggle button hidden in portrait
- **GIVEN** the viewport width is 720px or less
- **WHEN** viewing the UI controls
- **THEN** the UI toggle button is not displayed (CSS display: none)
- **AND** no UI toggle functionality is available

#### Scenario: UI toggle functionality disabled in portrait
- **GIVEN** the viewport width is 720px or less
- **WHEN** the toggle UI function is called
- **THEN** the function returns early without changing UI state
- **AND** the UI remains visible

### Requirement: Orientation Change UI Restoration

The UI SHALL automatically show when the viewport changes from landscape to portrait mode.

#### Scenario: UI appears on landscape-to-portrait rotation
- **GIVEN** the viewport is wider than 720px with UI potentially hidden
- **WHEN** the viewport width changes to 720px or less
- **THEN** the UI immediately becomes visible
- **AND** any manual hide state is cleared
- **AND** the UI remains visible as per portrait mode behavior

#### Scenario: Resize event detection
- **GIVEN** the application is listening for resize events
- **WHEN** the window is resized
- **THEN** portrait mode detection runs
- **AND** UI visibility is adjusted if entering portrait mode

### Requirement: Genre Filter Modal

The genre filter SHALL display in a modal dialog instead of an inline dropdown.

#### Scenario: Genre filter opens in modal
- **GIVEN** the user clicks the "ジャンルで絞り込み" button
- **WHEN** the button click is processed
- **THEN** a modal dialog appears centered on screen
- **AND** the modal displays all available genres in a scrollable list
- **AND** a backdrop overlay dims the background

#### Scenario: Modal is scrollable on small screens
- **GIVEN** the genre filter modal is open on a small screen
- **WHEN** there are more genres than fit in the viewport
- **THEN** the genre list is scrollable
- **AND** all genres remain accessible
- **AND** the modal header remains visible during scrolling

#### Scenario: Modal closes on backdrop click
- **GIVEN** the genre filter modal is open
- **WHEN** the user clicks the backdrop (outside the modal content)
- **THEN** the modal closes and returns to hidden state
- **AND** the main UI is fully interactive again

#### Scenario: Modal closes on close button click
- **GIVEN** the genre filter modal is open
- **WHEN** the user clicks the "✕" close button
- **THEN** the modal closes immediately
- **AND** selected genre filters are preserved

#### Scenario: Modal has high z-index
- **GIVEN** the genre filter modal is open
- **WHEN** viewing the layer stack
- **THEN** the modal has z-index 200
- **AND** the modal appears above all other UI elements
- **AND** the backdrop appears between modal and main UI

### Requirement: Full-Width Controls in Portrait

The control panel SHALL expand to full width in portrait mode.

#### Scenario: Control panel uses full width in portrait
- **GIVEN** the viewport width is 720px or less
- **WHEN** viewing the control panel
- **THEN** the panel has flex: 1 1 100%
- **AND** the panel has width: 100%
- **AND** the panel spans the full available width

#### Scenario: Provider filters span full width
- **GIVEN** the viewport width is 720px or less
- **WHEN** viewing the provider checkboxes
- **THEN** the provider container is not right-aligned
- **AND** the container uses the full panel width
