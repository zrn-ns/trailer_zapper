# movie-filtering Spec Delta

## ADDED Requirements

### Requirement: Sort Order Selection

Users SHALL be able to select from multiple sort orders to control how movies are discovered.

#### Scenario: Sort order dropdown is available
- **GIVEN** the application is running
- **WHEN** viewing the control panel
- **THEN** a sort order dropdown is visible
- **AND** the dropdown contains all available sort options
- **AND** a default sort order is selected (popularity descending)

#### Scenario: All TMDB sort options are available
- **GIVEN** the sort order dropdown is open
- **WHEN** viewing the available options
- **THEN** the following options are available:
  - Popularity (high to low)
  - Popularity (low to high)
  - Release Date (newest first)
  - Release Date (oldest first)
  - Rating (high to low)
  - Rating (low to high)
  - Vote Count (most to least)
  - Vote Count (least to most)
  - Revenue (high to low)
  - Revenue (low to high)
  - Title (A-Z)
  - Title (Z-A)

#### Scenario: Changing sort order fetches new movies
- **GIVEN** the user is viewing movies with one sort order
- **WHEN** the user selects a different sort order from the dropdown
- **THEN** the current movie list is cleared
- **AND** the viewing history is reset
- **AND** new movies are fetched with the selected sort order
- **AND** the first movie from the new list is displayed

#### Scenario: Sort order applies to API requests
- **GIVEN** a sort order is selected
- **WHEN** fetching movies from TMDB API
- **THEN** the `sort_by` parameter matches the selected sort order
- **AND** the API returns movies in the requested order

### Requirement: Sort Order Persistence

The selected sort order SHALL persist across browser sessions.

#### Scenario: Sort order is saved to localStorage
- **GIVEN** the user selects a sort order
- **WHEN** the selection is made
- **THEN** the sort order is saved to localStorage
- **AND** the key is "sortOrder"

#### Scenario: Sort order is restored on page load
- **GIVEN** the user previously selected a specific sort order
- **WHEN** the user returns to the application
- **THEN** the dropdown shows the previously selected sort order
- **AND** movies are fetched using the saved sort order

#### Scenario: Default sort order used when no preference saved
- **GIVEN** the user has never selected a sort order
- **WHEN** the application loads for the first time
- **THEN** the default sort order (popularity descending) is used
- **AND** the dropdown shows this default selection

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

Changing the sort order SHALL reset browsing state to provide a fresh discovery experience.

#### Scenario: Movie list is cleared on sort change
- **GIVEN** the user is viewing a list of movies
- **WHEN** the sort order is changed
- **THEN** the current movies array is emptied
- **AND** the processed movies set is cleared
- **AND** fresh movies are fetched

#### Scenario: History is reset on sort change
- **GIVEN** the user has navigation history (previous movies)
- **WHEN** the sort order is changed
- **THEN** the history array is cleared
- **AND** the previous button becomes disabled
- **AND** the user starts fresh with the new sort order

#### Scenario: Page counter is reset on sort change
- **GIVEN** the user has loaded multiple pages of movies
- **WHEN** the sort order is changed
- **THEN** the current page is reset to 1
- **AND** the first page of movies with the new sort order is fetched
