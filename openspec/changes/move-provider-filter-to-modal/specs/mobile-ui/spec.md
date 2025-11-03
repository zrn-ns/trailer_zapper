# mobile-ui Delta

## MODIFIED Requirements

### Requirement: Control Panel Vertical Space

The control panel SHALL fit within the viewport without vertical scrolling on mobile devices.

#### Scenario: Control panel does not overflow on small screens
- **GIVEN** the application is running on a mobile device (width ≤ 1024px)
- **WHEN** viewing the control panel
- **THEN** the entire control panel is visible without scrolling
- **AND** all filter buttons (provider, genre, sort order) are accessible
- **AND** the Apply and Reset buttons are visible

#### Scenario: Provider filter uses modal instead of inline checkboxes
- **GIVEN** the application is running on a mobile device
- **WHEN** viewing the control panel
- **THEN** provider checkboxes are NOT displayed inline
- **AND** a single "配信サービスで絞り込み" button is displayed
- **AND** the button opens a modal when clicked

#### Scenario: Provider modal is mobile-friendly
- **GIVEN** the application is running on a mobile device
- **WHEN** the user opens the provider filter modal
- **THEN** the modal displays full-screen or near-full-screen
- **AND** all six provider checkboxes are easily tappable
- **AND** the modal has adequate touch targets (minimum 44x44px)
- **AND** the close button is easily accessible

#### Scenario: Modal backdrop prevents interaction with underlying UI
- **GIVEN** the provider filter modal is open on a mobile device
- **WHEN** the user attempts to interact with the underlying UI
- **THEN** the backdrop blocks the interaction
- **AND** only the modal content is interactive
- **AND** tapping the backdrop closes the modal
