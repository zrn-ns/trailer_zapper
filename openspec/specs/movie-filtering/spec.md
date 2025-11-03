# movie-filtering Specification

## Purpose
This specification defines how users can filter and sort movies to customize their discovery experience. It covers sort order selection, persistence of user preferences, and the interaction between sorting and filtering options.
## Requirements
### Requirement: Sort Order Selection

Users SHALL be able to select from multiple sort orders to control how movies are discovered. This requirement is modified to use deferred application.

#### Scenario: Changing sort order does not immediately fetch new movies
- **GIVEN** the user is viewing movies with one sort order
- **WHEN** the user selects a different sort order from the dropdown
- **THEN** the current movie list is NOT updated
- **AND** new movies are NOT fetched immediately
- **AND** the pending sort order is updated
- **AND** the "Apply" button becomes enabled

#### Scenario: Sort order is applied when Apply button is clicked
- **GIVEN** the user has changed the sort order in the dropdown
- **AND** the change has not been applied yet
- **WHEN** the user clicks the "Apply" button
- **THEN** the current movie list is cleared
- **AND** the viewing history is reset
- **AND** new movies are fetched with the selected sort order
- **AND** the first movie from the new list is displayed

### Requirement: Sort Order Persistence

The selected sort order SHALL persist across browser sessions. This requirement is modified to save only when "Apply" is clicked.

#### Scenario: Sort order is saved to localStorage only on Apply
- **GIVEN** the user selects a different sort order
- **WHEN** the user clicks the "Apply" button
- **THEN** the sort order is saved to localStorage
- **AND** the key is "sortOrder"

#### Scenario: Changing sort order without Apply does not save
- **GIVEN** the user selects a different sort order
- **AND** does NOT click "Apply"
- **WHEN** the user reloads the page
- **THEN** the dropdown shows the previously applied sort order
- **AND** the temporary change is lost

### Requirement: Sort Order Interaction with Filters

Sort order SHALL work in combination with provider and genre filters.

#### Scenario: Sort order applies with provider filters
- **GIVEN** provider filters (Netflix, Prime Video) are selected
- **WHEN** changing the sort order
- **THEN** movies are fetched matching both the providers AND the sort order
- **AND** the movie list updates accordingly

#### Scenario: Sort order applies with genre filters
- **GIVEN** genre filters are selected
- **WHEN** changing the sort order
- **THEN** movies are fetched matching both the genres AND the sort order
- **AND** the movie list updates accordingly

#### Scenario: Sort order applies with combined filters
- **GIVEN** both provider and genre filters are active
- **WHEN** changing the sort order
- **THEN** movies are fetched matching providers, genres, AND sort order
- **AND** all filtering criteria are combined correctly

### Requirement: State Reset on Sort Change

Changing the sort order SHALL reset browsing state to provide a fresh discovery experience. This requirement is modified to apply only when "Apply" is clicked.

#### Scenario: Movie list is cleared only on Apply
- **GIVEN** the user has changed the sort order
- **WHEN** the user clicks the "Apply" button
- **THEN** the current movies array is emptied
- **AND** the processed movies set is cleared
- **AND** fresh movies are fetched

#### Scenario: History is reset only on Apply
- **GIVEN** the user has changed the sort order
- **AND** the user has navigation history (previous movies)
- **WHEN** the user clicks the "Apply" button
- **THEN** the history array is cleared
- **AND** the previous button becomes disabled
- **AND** the user starts fresh with the new sort order

### Requirement: Default Provider Selection

Provider checkboxes SHALL be checked by default on first visit to provide immediate content discovery. This requirement is modified to support six providers instead of two.

#### Scenario: All six providers are checked by default on first visit
- **GIVEN** the user is visiting the application for the first time
- **AND** no provider preferences are saved in localStorage
- **WHEN** the application initializes
- **THEN** all six provider checkboxes are checked:
  - Netflix ✓
  - Prime Video ✓
  - Hulu ✓
  - U-NEXT ✓
  - Disney Plus ✓
  - Apple TV+ ✓
- **AND** movies from all six providers are displayed

#### Scenario: HTML checkboxes have checked attribute
- **GIVEN** the application HTML is loaded
- **WHEN** viewing the provider filter section
- **THEN** all six provider checkboxes have the `checked` attribute
- **AND** all checkboxes are visually checked

#### Scenario: JavaScript state matches HTML on first visit
- **GIVEN** the user is visiting for the first time
- **AND** localStorage has no saved provider preferences (null)
- **WHEN** the JavaScript initialization runs
- **THEN** all six provider checkboxes are set to `checked = true`
- **AND** the pending state includes all six provider IDs
- **AND** the applied state includes all six provider IDs

#### Scenario: Saved preferences override default on subsequent visits
- **GIVEN** the user previously saved provider preferences to localStorage
- **WHEN** the user returns to the application
- **THEN** the checkboxes reflect the saved preferences
- **AND** the default checked state is overridden
- **AND** only the previously selected providers are checked
- **AND** both pending and applied states match the saved preferences

### Requirement: Extended Provider Support

The system SHALL support six streaming providers for the Japanese market, expanding from the current two providers.

#### Scenario: All six providers are available for selection
- **GIVEN** the application is running
- **WHEN** viewing the provider filter section
- **THEN** six provider checkboxes are visible:
  - Netflix (ID: 8)
  - Prime Video (ID: 9)
  - Hulu (ID: 15)
  - U-NEXT (ID: 84)
  - Disney Plus (ID: 337)
  - Apple TV+ (ID: 350)
- **AND** all checkboxes are functional
- **AND** each checkbox is clearly labeled with the service name

#### Scenario: New providers integrate with TMDB API
- **GIVEN** a user selects one or more of the new providers
- **AND** clicks the "Apply" button
- **WHEN** fetching movies from TMDB API
- **THEN** the `with_watch_providers` parameter includes the selected provider IDs
- **AND** the API returns movies available on those providers in Japan
- **AND** the region parameter is set to "JP"

### Requirement: Deferred Filter Application

The system SHALL support deferred filter application, allowing users to modify multiple filter criteria before applying changes in a single operation.

#### Scenario: Apply button is visible in control panel
- **GIVEN** the application is running
- **WHEN** viewing the control panel
- **THEN** an "Apply" button (適用) is visible
- **AND** the button is styled consistently with the application's design
- **AND** the button is positioned prominently for easy access

#### Scenario: Filters are not applied immediately
- **GIVEN** the application is displaying movies
- **WHEN** the user changes a provider checkbox
- **OR** the user changes the sort order dropdown
- **OR** the user changes genre filters
- **THEN** the current movie list is NOT updated
- **AND** the API is NOT called
- **AND** the pending changes are stored in temporary state

#### Scenario: Apply button applies all pending changes
- **GIVEN** the user has made multiple filter changes:
  - Changed provider selection from [Netflix] to [Netflix, Hulu]
  - Changed sort order from "popularity.desc" to "release_date.desc"
  - Changed genre selection to include "Action"
- **WHEN** the user clicks the "Apply" button
- **THEN** all changes are applied simultaneously
- **AND** a single API request is made with all updated parameters
- **AND** the movie list is refreshed with the new filters
- **AND** the current movie index is reset to 0
- **AND** the history is cleared
- **AND** the new filter state is saved to localStorage

#### Scenario: Apply button is disabled when no changes are pending
- **GIVEN** the application is running with active filters
- **AND** no pending filter changes exist
- **WHEN** viewing the control panel
- **THEN** the "Apply" button is disabled or visually indicates no action is needed
- **AND** clicking the button has no effect

#### Scenario: Apply button is enabled when changes are pending
- **GIVEN** the application is running
- **WHEN** the user modifies any filter (provider, sort order, or genre)
- **THEN** the "Apply" button becomes enabled
- **AND** the button is visually highlighted to indicate pending changes

### Requirement: Reset Filter Changes

The system SHALL provide a "Reset" button that discards pending filter changes and reverts to the last applied state.

#### Scenario: Reset button is visible in control panel
- **GIVEN** the application is running
- **WHEN** viewing the control panel
- **THEN** a "Reset" button (リセット) is visible
- **AND** the button is positioned near the "Apply" button
- **AND** the button is styled consistently with the application's design

#### Scenario: Reset button discards pending changes
- **GIVEN** the user has made pending filter changes:
  - Changed providers from [Netflix, Prime Video] to [Hulu, U-NEXT]
  - Changed sort order from "popularity.desc" to "vote_average.desc"
- **AND** has NOT clicked "Apply"
- **WHEN** the user clicks the "Reset" button
- **THEN** all pending changes are discarded
- **AND** the UI reverts to show the last applied filter state
- **AND** provider checkboxes show the last applied providers
- **AND** sort order dropdown shows the last applied sort order
- **AND** genre filters show the last applied genres
- **AND** no API request is made

#### Scenario: Reset button is disabled when no changes are pending
- **GIVEN** the application is running
- **AND** no pending filter changes exist
- **WHEN** viewing the control panel
- **THEN** the "Reset" button is disabled or visually indicates no action is needed
- **AND** clicking the button has no effect

### Requirement: Pending State Management

The system SHALL maintain separate state for pending filter changes and applied filter state.

#### Scenario: Pending state is initialized from applied state
- **GIVEN** the application is loading
- **WHEN** initializing filter state
- **THEN** the pending state is set to match the applied state (from localStorage or defaults)
- **AND** both states are synchronized initially

#### Scenario: Pending state is updated on filter interaction
- **GIVEN** the application is running
- **WHEN** the user interacts with any filter control
- **THEN** only the pending state is updated
- **AND** the applied state remains unchanged
- **AND** the UI reflects the pending state

#### Scenario: Applied state is updated only on Apply
- **GIVEN** the user has made pending filter changes
- **WHEN** the user clicks the "Apply" button
- **THEN** the applied state is updated to match the pending state
- **AND** the applied state is persisted to localStorage
- **AND** API requests use the applied state

