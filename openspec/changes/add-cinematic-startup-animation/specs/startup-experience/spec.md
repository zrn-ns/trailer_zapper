# Startup Experience Specification

## ADDED Requirements

### Requirement: Gradual Dimming Animation

The application SHALL display a gradual dimming animation when the page loads, simulating the experience of theater lights gradually turning down before a movie begins.

#### Scenario: Initial page load with normal brightness

- **WHEN** the user first loads the application page
- **THEN** the page displays with normal brightness for a brief moment (< 0.1s)
- **AND** a dark overlay gradually appears over approximately 1.5 seconds

#### Scenario: Dimming animation completes

- **WHEN** the dimming animation completes
- **THEN** the background is darkened to simulate a theater environment
- **AND** the startup modal remains clearly visible and readable
- **AND** the "Start" button is prominent and ready for user interaction

### Requirement: Startup Modal Visibility

The startup modal SHALL remain visible and legible throughout the dimming animation, ensuring users can read the content and interact with the start button.

#### Scenario: Modal visibility during animation

- **WHEN** the dimming animation is in progress
- **THEN** the modal content remains at full opacity
- **AND** the modal is positioned prominently in the center of the screen
- **AND** all text and buttons are clearly readable

### Requirement: User-Triggered Transition to Playback

The application SHALL transition to video playback mode only when the user clicks the start button, maintaining compliance with YouTube API autoplay policies.

#### Scenario: User clicks start button

- **WHEN** the user clicks the "開始する" (Start) button
- **THEN** the page transitions to complete darkness over 0.5 seconds
- **AND** the modal disappears with a fade-out effect
- **AND** the video player becomes active and begins loading content
- **AND** audio is enabled for playback (complying with user interaction requirement)

#### Scenario: Keyboard interaction with start button

- **WHEN** the startup modal is displayed
- **AND** the user presses Space or Enter key
- **THEN** the same transition occurs as clicking the button

### Requirement: Performance Optimization

The dimming animation SHALL be implemented using GPU-accelerated CSS properties to ensure smooth performance across devices.

#### Scenario: Animation uses GPU acceleration

- **WHEN** the dimming animation runs
- **THEN** only GPU-accelerated properties are animated (opacity, transform)
- **AND** no layout-triggering properties are animated (width, height, margin, padding)
- **AND** the animation runs at 60fps on modern devices

#### Scenario: Low-end device performance

- **WHEN** running on a lower-end device
- **THEN** the animation still completes smoothly without janking
- **AND** the page remains responsive to user interaction during animation

### Requirement: Accessibility - Reduced Motion Support

The application SHALL respect the user's `prefers-reduced-motion` system preference by disabling animations when requested.

#### Scenario: User has reduced motion preference enabled

- **WHEN** the user's system has `prefers-reduced-motion: reduce` set
- **THEN** the dimming animation is skipped
- **AND** the page displays in the dimmed state immediately
- **AND** the startup modal is visible without animation
- **AND** clicking the start button results in an instant transition to playback

### Requirement: Animation Timing

The startup animation sequence SHALL complete within a reasonable timeframe to avoid user frustration.

#### Scenario: Total animation duration

- **WHEN** the page loads without user interaction
- **THEN** the auto-playing dimming animation completes within 2.5 seconds
- **AND** the start button is immediately available for interaction

#### Scenario: User-triggered transition timing

- **WHEN** the user clicks the start button
- **THEN** the transition to playback mode completes within 0.5 seconds
- **AND** feels responsive to the user's action

### Requirement: Smooth Easing Functions

The animations SHALL use appropriate easing functions to create a natural, theatrical feel.

#### Scenario: Dimming animation easing

- **WHEN** the gradual dimming animation plays
- **THEN** it uses an ease-out timing function
- **AND** the animation starts quickly and slows down gradually
- **AND** creates a natural lighting-down effect

#### Scenario: Final fade easing

- **WHEN** transitioning to playback after button click
- **THEN** it uses an ease-in timing function
- **AND** the fade accelerates into complete darkness
- **AND** feels immediate and responsive
