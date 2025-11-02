# movie-filtering Specification Delta

## ADDED Requirements

### Requirement: Default Provider Selection

Provider checkboxes SHALL be checked by default on first visit to provide immediate content discovery.

#### Scenario: Both providers are checked by default on first visit
- **GIVEN** the user is visiting the application for the first time
- **AND** no provider preferences are saved in localStorage
- **WHEN** the application initializes
- **THEN** the Netflix checkbox is checked
- **AND** the Prime Video checkbox is checked
- **AND** movies from both providers are displayed

#### Scenario: HTML checkboxes have checked attribute
- **GIVEN** the application HTML is loaded
- **WHEN** viewing the provider filter section
- **THEN** the Netflix checkbox has the `checked` attribute
- **AND** the Prime Video checkbox has the `checked` attribute
- **AND** both checkboxes are visually checked

#### Scenario: JavaScript state matches HTML on first visit
- **GIVEN** the user is visiting for the first time
- **AND** localStorage has no saved provider preferences (null)
- **WHEN** the JavaScript initialization runs
- **THEN** `netflixFilter.checked` is set to `true`
- **AND** `primeVideoFilter.checked` is set to `true`
- **AND** the application state reflects both providers as selected

#### Scenario: Saved preferences override default on subsequent visits
- **GIVEN** the user previously saved provider preferences to localStorage
- **WHEN** the user returns to the application
- **THEN** the checkboxes reflect the saved preferences
- **AND** the default checked state is overridden
- **AND** only the previously selected providers are checked

#### Scenario: User can still deselect providers
- **GIVEN** both providers are checked by default
- **WHEN** the user unchecks one or both providers
- **THEN** the selection is saved to localStorage
- **AND** the movie list updates to reflect the new filter
- **AND** the unchecked state persists across page reloads

#### Scenario: localStorage null check is performed
- **GIVEN** the application is initializing
- **WHEN** checking for saved provider preferences
- **THEN** the code explicitly checks if `savedProviders === null`
- **AND** treats `null` differently from an empty array
- **AND** applies default selections only when `null`
