# Implementation Tasks

## Task 1: Hide UI toggle button in portrait mode
- [x] Add CSS media query for portrait mode (max-width: 720px)
- [x] Set `.ui-toggle-button { display: none; }` in portrait breakpoint
- **Verification**: Toggle button not visible on screens ≤720px width

## Task 2: Prevent UI auto-hide in portrait mode
- [x] Add portrait detection in `hideUI()` function
- [x] Return early if `window.innerWidth <= 720` (portrait mode)
- [x] Add check to respect `force` parameter override
- **Verification**: UI never auto-hides on narrow screens

## Task 3: Disable UI toggle functionality in portrait
- [x] Add portrait detection in `toggleUIVisibility()` function
- [x] Return early if in portrait mode
- **Verification**: Clicking toggle button (if visible) does nothing in portrait

## Task 4: Handle orientation changes
- [x] Add `resize` event listener to window
- [x] Detect when switching to portrait mode (`window.innerWidth <= 720`)
- [x] Force UI to show when entering portrait mode
- [x] Reset manual hide state
- **Verification**: UI appears when rotating to portrait

## Task 5: Create genre filter modal HTML
- [x] Add `#genre-filter-modal` container to `client/index.html`
- [x] Add backdrop, content, header, and list elements
- [x] Add close button with "✕" symbol
- [x] Initially hide modal with `.hidden` class
- **Verification**: Modal structure exists in DOM

## Task 6: Style genre filter modal
- [x] Create modal styles with fixed positioning and z-index 200
- [x] Style backdrop with semi-transparent overlay
- [x] Style content container with scrollable list
- [x] Add responsive sizing for different screen sizes
- [x] Implement `.hidden` state (display: none)
- **Verification**: Modal appears centered and scrollable

## Task 7: Implement modal open/close logic
- [x] Get references to modal elements in script.js
- [x] Add click handler to genre filter toggle button
- [x] Add click handler to modal close button
- [x] Add click handler to backdrop for dismissal
- [x] Populate genre list in modal dynamically
- **Verification**: Modal opens, closes, and displays genres

## Task 8: Make provider container full width in portrait
- [x] Add `.control-panel { flex: 1 1 100%; width: 100%; }` in portrait breakpoint
- **Verification**: Provider checkboxes use full width on narrow screens

## Task 9: Test portrait mode behavior
- [x] Test UI always visible in portrait
- [x] Test toggle button hidden in portrait
- [x] Test genre modal on various screen sizes
- [x] Test orientation change from landscape to portrait
- **Verification**: All portrait mode features work correctly

## Dependencies
- Tasks 1-3 can be done in parallel (all related to UI control)
- Task 4 depends on Tasks 1-3 (builds on UI control logic)
- Tasks 5-6 can be done in parallel with Tasks 1-4 (separate modal feature)
- Task 7 depends on Tasks 5-6 (requires modal structure)
- Task 8 is independent (CSS-only)
- Task 9 must be done last (integration testing)
