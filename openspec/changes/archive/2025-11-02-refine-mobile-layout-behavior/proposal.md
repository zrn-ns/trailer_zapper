# Proposal: Refine Mobile Layout Behavior

## Why

The current mobile responsive design has usability issues in portrait mode (≤720px):

1. **UI auto-hide conflicts with portrait layout**: The UI automatically hides after inactivity, making controls inaccessible when users need them most on narrow screens
2. **UI toggle button is unnecessary in portrait**: Since portrait mode should always show UI, the toggle button adds clutter without value
3. **Genre filter overflow**: The genre filter list can overflow the viewport on small screens, making some genres inaccessible
4. **Orientation change issues**: When rotating from landscape to portrait, the UI may remain hidden

Users on mobile devices in portrait orientation need persistent access to controls and should never encounter overflow or hidden UI issues.

## What Changes

- Always show UI in portrait mode (≤720px) without auto-hide behavior
- Hide the UI toggle button in portrait mode as it serves no purpose
- Convert genre filter to a modal dialog that works on all screen sizes
- Automatically show UI when switching from landscape to portrait orientation
- Disable UI toggle functionality in portrait mode to prevent accidental hiding

## Impact

- Affected specs: `mobile-ui` (enhancement)
- Affected code:
  - `client/index.html`: Add genre filter modal structure
  - `client/style.css`: Hide toggle button in portrait, style modal
  - `client/script.js`:
    - Prevent UI hiding in portrait mode
    - Disable toggle in portrait mode
    - Handle orientation changes
    - Implement modal open/close logic
- User experience: More reliable mobile portrait experience
- Performance: No significant impact
