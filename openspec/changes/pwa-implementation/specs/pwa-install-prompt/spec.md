# pwa-install-prompt Specification

## Purpose
Provides a user-friendly install banner that prompts users to add Trailer Zapper to their home screen, making the PWA installation discoverable and accessible.

## ADDED Requirements

### Requirement: Install Banner UI

The application SHALL display an install banner that prompts users to install the app when appropriate.

#### Scenario: Banner has clear visual design
- **GIVEN** the install banner is displayed
- **WHEN** viewing the banner
- **THEN** it contains an icon (📱), title, description, and action buttons
- **AND** the design is consistent with the app's cinematic theme
- **AND** the banner is semi-transparent with backdrop blur

#### Scenario: Banner positioned at bottom of screen
- **GIVEN** the install banner is displayed
- **WHEN** viewing the screen layout
- **THEN** the banner is fixed to the bottom of the viewport
- **AND** has z-index: 100 (above video, below modals)
- **AND** does not obstruct critical UI elements

#### Scenario: Banner has slide-up animation
- **GIVEN** the banner is triggered to appear
- **WHEN** the banner displays
- **THEN** it slides up from the bottom with a 0.3s ease-out animation
- **AND** the animation feels smooth and professional

#### Scenario: Banner can be hidden
- **GIVEN** the install banner is displayed
- **WHEN** the banner has class "hidden"
- **THEN** display: none is applied
- **AND** the banner is removed from the layout

### Requirement: beforeinstallprompt Event Handling

The application SHALL capture and defer the browser's native install prompt to provide custom UI.

#### Scenario: beforeinstallprompt event captured
- **GIVEN** the application has loaded in a browser supporting PWA installation
- **WHEN** the beforeinstallprompt event fires
- **THEN** event.preventDefault() is called
- **AND** the deferredPrompt is stored for later use
- **AND** the custom install banner is displayed

#### Scenario: Event not captured on unsupported browsers
- **GIVEN** the application loads in a browser without PWA support
- **WHEN** checking for beforeinstallprompt
- **THEN** the event does not fire
- **AND** the install banner remains hidden
- **AND** no errors occur

### Requirement: Install Button Action

The "インストール" button SHALL trigger the browser's install dialog when clicked.

#### Scenario: Install button triggers prompt
- **GIVEN** the install banner is displayed with a deferred prompt
- **WHEN** the user clicks the "インストール" button
- **THEN** deferredPrompt.prompt() is called
- **AND** the browser's native install dialog appears
- **AND** the custom banner remains visible until user responds

#### Scenario: User accepts installation
- **GIVEN** the native install dialog is displayed
- **WHEN** the user clicks "Install" in the dialog
- **THEN** the app is added to the home screen
- **AND** the custom banner is hidden
- **AND** the deferredPrompt is set to null

#### Scenario: User cancels installation
- **GIVEN** the native install dialog is displayed
- **WHEN** the user clicks "Cancel" in the dialog
- **THEN** the custom banner remains visible
- **AND** the deferredPrompt is still available
- **AND** the user can try again later

### Requirement: Dismiss Button Action

The "後で" button SHALL close the banner and remember the user's choice.

#### Scenario: Dismiss button closes banner
- **GIVEN** the install banner is displayed
- **WHEN** the user clicks the "後で" button
- **THEN** the banner is hidden immediately
- **AND** the hidden class is added
- **AND** the user can continue using the app

#### Scenario: Dismiss preference persisted
- **GIVEN** the user clicked "後で"
- **WHEN** the dismiss action completes
- **THEN** localStorage.setItem('pwa-install-dismissed', 'true') is called
- **AND** the preference is saved across sessions

#### Scenario: Banner respects dismiss preference
- **GIVEN** localStorage has 'pwa-install-dismissed' set to 'true'
- **WHEN** the beforeinstallprompt event fires
- **THEN** the banner does not display
- **AND** the user is not prompted again

#### Scenario: Dismiss preference expires
- **GIVEN** the user dismissed the banner more than 7 days ago
- **WHEN** the application checks the dismiss timestamp
- **THEN** the preference is considered expired
- **AND** the banner can be shown again on next visit

### Requirement: appinstalled Event Handling

The application SHALL detect when the app is installed and update UI accordingly.

#### Scenario: appinstalled event detected
- **GIVEN** the user has installed the app
- **WHEN** the appinstalled event fires
- **THEN** the event is logged to console
- **AND** the install banner is hidden permanently
- **AND** localStorage.setItem('pwa-installed', 'true') is called

#### Scenario: Banner hidden after installation
- **GIVEN** localStorage has 'pwa-installed' set to 'true'
- **WHEN** the application loads
- **THEN** the install banner never displays
- **AND** no install-related UI is shown

### Requirement: Banner Display Logic

The application SHALL show the install banner only when appropriate conditions are met.

#### Scenario: Banner shows for installable PWA
- **GIVEN** the app is installable (manifest valid, HTTPS, not yet installed)
- **WHEN** the beforeinstallprompt event fires
- **THEN** the banner displays after 3 seconds
- **AND** gives the user time to orient themselves

#### Scenario: Banner not shown if already installed
- **GIVEN** the app is already installed (pwa-installed = true)
- **WHEN** the application loads
- **THEN** the banner never displays
- **AND** no deferredPrompt is stored

#### Scenario: Banner not shown if recently dismissed
- **GIVEN** the user dismissed the banner within the last 7 days
- **WHEN** the application loads
- **THEN** the banner does not display
- **AND** the user is not re-prompted unnecessarily

#### Scenario: Banner not shown during startup modal
- **GIVEN** the startup modal is displayed
- **WHEN** checking banner display conditions
- **THEN** the banner is deferred until after startup completes
- **AND** does not interfere with the initial experience

### Requirement: Responsive Banner Design

The install banner SHALL adapt to different screen sizes appropriately.

#### Scenario: Banner adapts to mobile portrait
- **GIVEN** the viewport width is 720px or less
- **WHEN** viewing the install banner
- **THEN** the banner spans full width with minimal padding
- **AND** buttons stack vertically if needed
- **AND** text is readable on small screens

#### Scenario: Banner adapts to desktop
- **GIVEN** the viewport width is greater than 1024px
- **WHEN** viewing the install banner
- **THEN** the banner has max-width constraint (e.g., 600px)
- **AND** is centered horizontally
- **AND** has appropriate padding and margins

### Requirement: Banner Accessibility

The install banner SHALL be accessible to keyboard and screen reader users.

#### Scenario: Banner is keyboard navigable
- **GIVEN** the install banner is displayed
- **WHEN** the user presses Tab
- **THEN** focus moves to the "インストール" button
- **AND** Tab again moves to "後で" button
- **AND** Enter activates the focused button

#### Scenario: Banner has proper ARIA labels
- **GIVEN** the install banner markup
- **WHEN** examining ARIA attributes
- **THEN** buttons have appropriate aria-label or visible text
- **AND** the banner has role="dialog" if appropriate
- **AND** screen readers can understand the banner's purpose
