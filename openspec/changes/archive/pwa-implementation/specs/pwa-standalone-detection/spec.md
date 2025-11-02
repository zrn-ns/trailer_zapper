# pwa-standalone-detection Specification

## Purpose
Detects when the application is running in standalone mode (launched from home screen) and adapts the UI accordingly, primarily by hiding the fullscreen button since browser UI is already absent.

## ADDED Requirements

### Requirement: Standalone Mode Detection

The application SHALL detect when it is running in standalone mode.

#### Scenario: iOS Safari standalone detection
- **GIVEN** the application is launched from iOS home screen
- **WHEN** checking window.navigator.standalone
- **THEN** the property returns true
- **AND** the app is identified as running in standalone mode

#### Scenario: Android Chrome standalone detection
- **GIVEN** the application is launched from Android home screen
- **WHEN** checking window.matchMedia('(display-mode: standalone)').matches
- **THEN** the media query returns true
- **AND** the app is identified as running in standalone mode

#### Scenario: Desktop PWA standalone detection
- **GIVEN** the application is launched as installed PWA on desktop
- **WHEN** checking window.matchMedia('(display-mode: standalone)').matches
- **THEN** the media query returns true
- **AND** the app is identified as running in standalone mode

#### Scenario: Browser mode detection
- **GIVEN** the application is opened in a normal browser tab
- **WHEN** checking standalone detection
- **THEN** window.navigator.standalone is false or undefined
- **AND** display-mode: standalone media query is false
- **AND** the app is NOT in standalone mode

### Requirement: Fullscreen Button Control

The fullscreen button SHALL be hidden when running in standalone mode.

#### Scenario: Fullscreen button hidden in standalone
- **GIVEN** the application is running in standalone mode
- **WHEN** the UI initializes
- **THEN** the fullscreen button element has display: none applied
- **AND** the button is not visible to the user
- **AND** no space is reserved for the button in the layout

#### Scenario: Fullscreen button visible in browser
- **GIVEN** the application is running in a normal browser
- **WHEN** the UI initializes
- **THEN** the fullscreen button is visible
- **AND** the button is functional and clickable
- **AND** clicking it triggers fullscreen mode

#### Scenario: Fullscreen button detection on page load
- **GIVEN** the page is loading
- **WHEN** the standalone detection runs (after DOM ready)
- **THEN** the fullscreen button visibility is set immediately
- **AND** no flash of visible/hidden button occurs

### Requirement: Standalone Mode Logging

The application SHALL log standalone mode status for debugging.

#### Scenario: Standalone mode logged
- **GIVEN** the application detects standalone mode
- **WHEN** initialization completes
- **THEN** a console log message states "[PWA] Running in standalone mode"
- **AND** developers can verify the detection worked

#### Scenario: Browser mode logged
- **GIVEN** the application detects browser mode
- **WHEN** initialization completes
- **THEN** a console log message states "[PWA] Running in browser mode"
- **AND** developers can verify the detection worked

### Requirement: Standalone Detection Function

A standalone detection utility function SHALL be available for use throughout the application.

#### Scenario: isStandalone function exists
- **GIVEN** the client/script.js file
- **WHEN** examining utility functions
- **THEN** an isStandalone() function is defined
- **AND** the function returns a boolean
- **AND** the function can be called from anywhere in the app

#### Scenario: isStandalone returns correct value
- **GIVEN** the isStandalone() function
- **WHEN** called in standalone mode
- **THEN** it returns true
- **WHEN** called in browser mode
- **THEN** it returns false

#### Scenario: isStandalone handles undefined properties
- **GIVEN** window.navigator.standalone is undefined (non-iOS browser)
- **WHEN** isStandalone() is called
- **THEN** no errors occur
- **AND** the function falls back to display-mode media query
- **AND** returns the correct boolean value

### Requirement: MODIFIED - Fullscreen Button in mobile-ui

The fullscreen button behavior in mobile-ui SHALL consider standalone mode.

#### Scenario: iOS Safari fullscreen respects standalone
- **GIVEN** the application is running on iOS Safari in standalone mode
- **WHEN** checking the fullscreen button
- **THEN** the button is hidden (display: none)
- **AND** this supplements the existing iOS Safari fullscreen fallback behavior
- **AND** users understand fullscreen is not needed (browser UI already absent)

### Requirement: Standalone Mode State Management

The application state SHALL include standalone mode detection.

#### Scenario: State includes isStandalone property
- **GIVEN** the global state object
- **WHEN** examining its properties
- **THEN** state.isStandalone exists
- **AND** it is set to the result of isStandalone()
- **AND** it can be referenced throughout the application

#### Scenario: Standalone state set on initialization
- **GIVEN** the application is initializing
- **WHEN** the DOMContentLoaded event fires
- **THEN** state.isStandalone is set before UI initialization
- **AND** UI components can use this state for conditional rendering

### Requirement: Standalone Mode User Experience

The user experience SHALL adapt seamlessly to standalone mode.

#### Scenario: No functional loss in standalone
- **GIVEN** the application is running in standalone mode
- **WHEN** the user interacts with the app
- **THEN** all core features work identically to browser mode
- **AND** video playback, navigation, filtering all function
- **AND** only the fullscreen button is hidden (unnecessary feature)

#### Scenario: Standalone feels native
- **GIVEN** the application is launched from home screen
- **WHEN** the app loads
- **THEN** no browser UI (address bar, tabs) is visible
- **AND** the app uses the full viewport
- **AND** the experience feels like a native app

#### Scenario: Returning to browser mode
- **GIVEN** the user opens the app in a browser after using standalone
- **WHEN** the app loads in browser mode
- **THEN** the fullscreen button reappears
- **AND** the user can enter fullscreen if desired
- **AND** the transition is seamless

### Requirement: Standalone Detection Cross-Browser Compatibility

Standalone detection SHALL work correctly across all supported browsers.

#### Scenario: Safari detection
- **GIVEN** the app is running in Safari (iOS or macOS)
- **WHEN** checking standalone mode
- **THEN** window.navigator.standalone is checked first
- **AND** the detection is accurate

#### Scenario: Chrome detection
- **GIVEN** the app is running in Chrome (Android or desktop)
- **WHEN** checking standalone mode
- **THEN** display-mode media query is used
- **AND** the detection is accurate

#### Scenario: Firefox detection
- **GIVEN** the app is running in Firefox
- **WHEN** checking standalone mode
- **THEN** display-mode media query is used
- **AND** the detection is accurate

#### Scenario: Edge detection
- **GIVEN** the app is running in Edge
- **WHEN** checking standalone mode
- **THEN** display-mode media query is used
- **AND** the detection is accurate
