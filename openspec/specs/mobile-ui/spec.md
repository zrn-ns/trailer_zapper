# mobile-ui Specification

## Purpose
TBD - created by archiving change add-mobile-responsiveness. Update Purpose after archive.
## Requirements
### Requirement: Touch Event Support

The application SHALL respond to touch events on mobile devices for UI control.

#### Scenario: UI shows on touch interaction
- **GIVEN** the application is running on a touch-enabled device
- **WHEN** the user touches or moves their finger on the screen
- **THEN** the UI overlay appears within 200-400ms
- **AND** the inactivity timeout starts

#### Scenario: UI hides after touch inactivity
- **GIVEN** the UI is visible on a mobile device
- **WHEN** no touch interaction occurs for 3 seconds
- **THEN** the UI overlay automatically hides
- **AND** the video remains visible

#### Scenario: Touch and mouse events coexist
- **GIVEN** the application supports both mouse and touch
- **WHEN** either input method is used
- **THEN** the UI responds appropriately to both
- **AND** no event conflicts or double-triggering occurs

### Requirement: Touch-Friendly Button Sizes

Interactive elements SHALL meet minimum touch target sizes on mobile devices.

#### Scenario: Buttons meet minimum size on mobile
- **GIVEN** the application is viewed on a mobile device (max-width: 720px)
- **WHEN** the user views interactive elements (buttons, controls)
- **THEN** all touch targets are at least 44x44 CSS pixels
- **AND** adequate spacing (minimum 8px) separates adjacent targets

#### Scenario: UI toggle button is easily tappable
- **GIVEN** the UI toggle button is displayed on mobile
- **WHEN** the user attempts to tap it
- **THEN** the button has a minimum size of 48x48px
- **AND** the tap area extends beyond visual boundaries if needed

### Requirement: Swipe Gesture Navigation

The application SHALL support horizontal swipe gestures for video navigation on touch devices.

#### Scenario: Swipe left to next video
- **GIVEN** a video is currently playing on a mobile device
- **WHEN** the user swipes left (with minimum 50px displacement)
- **THEN** the application loads the next video
- **AND** visual feedback indicates the action

#### Scenario: Swipe right to previous video
- **GIVEN** there is a previous video in history
- **WHEN** the user swipes right (with minimum 50px displacement)
- **THEN** the application loads the previous video
- **AND** visual feedback indicates the action

#### Scenario: Swipe gestures don't conflict with scrolling
- **GIVEN** the user is viewing scrollable content
- **WHEN** the user performs a vertical swipe gesture
- **THEN** the page scrolls normally
- **AND** horizontal swipes trigger navigation only when horizontal movement > vertical movement

#### Scenario: Prevent accidental navigation
- **GIVEN** the user is interacting with UI controls
- **WHEN** the user performs a swipe gesture
- **THEN** swipe navigation is disabled while interacting with buttons/dropdowns
- **AND** gestures only trigger on the video area or non-interactive regions

### Requirement: iOS Safe Area Support

The application SHALL respect iOS Safe Area insets for proper spacing on devices with notches.

#### Scenario: Content avoids notch on iPhone
- **GIVEN** the application is running on iOS with a notch
- **WHEN** viewing in portrait or landscape
- **THEN** critical UI elements avoid the Safe Area insets
- **AND** padding adjusts using env(safe-area-inset-*)

#### Scenario: Fullscreen respects home indicator
- **GIVEN** the user enters fullscreen on iOS
- **WHEN** viewing video content
- **THEN** controls avoid the bottom home indicator area
- **AND** adequate padding (env(safe-area-inset-bottom)) is applied

### Requirement: Orientation Change Handling

The application SHALL adapt layout when device orientation changes.

#### Scenario: Portrait to landscape transition
- **GIVEN** the application is in portrait mode
- **WHEN** the user rotates to landscape
- **THEN** the layout adjusts within 300ms
- **AND** video player maximizes available space
- **AND** UI controls remain accessible

#### Scenario: Landscape to portrait transition
- **GIVEN** the application is in landscape mode
- **WHEN** the user rotates to portrait
- **THEN** the layout adjusts to portrait orientation
- **AND** UI panels reflow to vertical stacking
- **AND** no content is cut off or inaccessible

### Requirement: Mobile-Optimized Controls

Keyboard shortcuts SHALL be disabled or adapted for mobile devices.

#### Scenario: Keyboard shortcuts disabled on touch devices
- **GIVEN** the application detects a touch-only device
- **WHEN** keyboard events are triggered
- **THEN** desktop keyboard shortcuts (Space, N, P, F, H) are disabled
- **AND** only essential shortcuts (Escape) remain active if external keyboard is present

#### Scenario: Touch device detection
- **GIVEN** the application loads
- **WHEN** checking for device capabilities
- **THEN** touch support is detected using ('ontouchstart' in window)
- **AND** mobile-specific features activate accordingly

### Requirement: Mobile Video Player Optimization

The video player SHALL optimize sizing and behavior for mobile screens.

#### Scenario: Video player fills mobile screen appropriately
- **GIVEN** the application is running on a mobile device
- **WHEN** a video is playing
- **THEN** the video player scales to fit the viewport
- **AND** maintains 16:9 aspect ratio where possible
- **AND** allows native mobile video controls when appropriate

#### Scenario: Fullscreen works on iOS Safari
- **GIVEN** the user is on iOS Safari
- **WHEN** toggling fullscreen
- **THEN** the application uses appropriate fullscreen API
- **AND** handles iOS Safari quirks (webkit-playsinline, etc.)
- **AND** gracefully falls back if fullscreen is unavailable

### Requirement: Progressive Enhancement

Mobile features SHALL enhance the experience without breaking desktop functionality.

#### Scenario: Desktop users unaffected by mobile features
- **GIVEN** a user accesses the application from a desktop browser
- **WHEN** using the application
- **THEN** all existing desktop features work normally
- **AND** mouse-based interactions remain primary
- **AND** no mobile-specific code interferes

#### Scenario: Hybrid device support
- **GIVEN** a device supports both touch and mouse (e.g., Surface, convertible laptop)
- **WHEN** using either input method
- **THEN** both input methods work simultaneously
- **AND** the UI responds to whichever input is used
- **AND** no conflicts arise between input methods

