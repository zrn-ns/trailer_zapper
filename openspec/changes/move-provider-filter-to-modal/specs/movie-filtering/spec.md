# movie-filtering Delta

## MODIFIED Requirements

### Requirement: Provider Filter UI Presentation

Provider filter controls SHALL be presented in a modal dialog to improve space efficiency and user experience. This requirement modifies how provider checkboxes are displayed in the UI.

#### Scenario: Provider filter button is visible in control panel
- **GIVEN** the application is running
- **WHEN** viewing the control panel
- **THEN** a "配信サービスで絞り込み" button is visible
- **AND** the button is styled consistently with the genre filter button
- **AND** individual provider checkboxes are NOT visible in the control panel

#### Scenario: Clicking provider filter button opens modal
- **GIVEN** the application is running
- **WHEN** the user clicks the "配信サービスで絞り込み" button
- **THEN** a modal dialog opens
- **AND** the modal contains all six provider checkboxes
- **AND** the modal has a backdrop overlay
- **AND** the modal has a close button (✕)

#### Scenario: Provider modal displays current selection state
- **GIVEN** the user has selected specific providers (e.g., Netflix and Hulu)
- **AND** has applied the filters
- **WHEN** the user opens the provider filter modal
- **THEN** the Netflix and Hulu checkboxes are checked
- **AND** other provider checkboxes are unchecked
- **AND** the modal reflects the current applied state

#### Scenario: Closing provider modal retains pending changes
- **GIVEN** the user has opened the provider filter modal
- **AND** has changed checkbox selections
- **AND** has NOT clicked Apply
- **WHEN** the user closes the modal
- **THEN** the pending provider selections are retained
- **AND** the Apply button remains enabled
- **AND** the changes are NOT applied to the movie list

#### Scenario: Provider modal can be closed via close button
- **GIVEN** the provider filter modal is open
- **WHEN** the user clicks the close button (✕)
- **THEN** the modal closes
- **AND** the backdrop is removed
- **AND** pending changes are retained

#### Scenario: Provider modal can be closed via backdrop click
- **GIVEN** the provider filter modal is open
- **WHEN** the user clicks the backdrop area
- **THEN** the modal closes
- **AND** pending changes are retained

#### Scenario: Provider modal can be closed via Escape key
- **GIVEN** the provider filter modal is open
- **WHEN** the user presses the Escape key
- **THEN** the modal closes
- **AND** pending changes are retained

#### Scenario: Provider filter modal has consistent styling with genre modal
- **GIVEN** the application is running
- **WHEN** viewing both provider and genre filter modals
- **THEN** both modals use consistent styling
- **AND** both have the same backdrop style
- **AND** both have the same header layout
- **AND** both have the same close button style
- **AND** both have the same content area style

### Requirement: Provider Filter Interaction

Provider filter changes SHALL follow the deferred application pattern, consistent with other filters.

#### Scenario: Changing provider checkboxes updates pending state only
- **GIVEN** the provider filter modal is open
- **WHEN** the user checks or unchecks a provider checkbox
- **THEN** only the pending state is updated
- **AND** the applied state remains unchanged
- **AND** the current movie list is NOT updated
- **AND** the Apply button becomes enabled (if not already)

#### Scenario: Provider changes are applied with Apply button
- **GIVEN** the user has changed provider selections in the modal
- **AND** has closed the modal
- **WHEN** the user clicks the Apply button
- **THEN** the pending provider state is copied to the applied state
- **AND** the provider selection is saved to localStorage
- **AND** new movies are fetched with the updated provider filter
- **AND** the movie list and history are reset

#### Scenario: Reset button reverts provider changes
- **GIVEN** the user has changed provider selections
- **AND** has NOT clicked Apply
- **WHEN** the user clicks the Reset button
- **THEN** the pending provider state reverts to the applied state
- **AND** the provider checkboxes in the modal reflect the reverted state
- **AND** the Apply button becomes disabled

### Requirement: Modal UI Persistence

The overlay UI SHALL remain visible while any filter modal is open to prevent user confusion.

#### Scenario: UI does not auto-hide when provider modal is open
- **GIVEN** the provider filter modal is open
- **WHEN** the auto-hide timer expires (after 3 seconds of inactivity)
- **THEN** the overlay UI remains visible
- **AND** the UI does NOT fade out
- **AND** the UI controls remain accessible

#### Scenario: UI does not auto-hide when genre modal is open
- **GIVEN** the genre filter modal is open
- **WHEN** the auto-hide timer expires
- **THEN** the overlay UI remains visible
- **AND** the UI does NOT fade out
- **AND** the UI controls remain accessible

#### Scenario: UI auto-hide resumes after modal is closed
- **GIVEN** a filter modal (provider or genre) was open
- **AND** the user closes the modal
- **WHEN** the user stops interacting for 3 seconds
- **THEN** the overlay UI automatically hides as normal
- **AND** the auto-hide timer starts counting from the modal close time

#### Scenario: Modal open state prevents UI toggle via click
- **GIVEN** a filter modal is open
- **WHEN** the user clicks on the video area (outside UI elements)
- **THEN** the UI does NOT toggle visibility
- **AND** the modal remains open
- **AND** only clicking the backdrop closes the modal
