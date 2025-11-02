# Implementation Tasks: Refine Playback UI

## Task 1: Remove video player border radius
- [x] Remove `border-radius` from `.player-shell` class in `client/style.css`
- [x] Remove `border-radius` from `#immersive-stage:fullscreen .player-shell` in `client/style.css`
- [x] **Verification**: Load the app and confirm video container has square corners
- [x] **Verification**: Enter fullscreen mode and confirm no rounded corners are visible

## Task 2: Simplify background to pure black
- [x] Replace `.immersive-stage` background with `background: #000` in `client/style.css`
- [x] Remove all gradient definitions from `.immersive-stage` background property
- [x] Replace `#immersive-stage:fullscreen` background with `background: #000`
- [x] **Verification**: View the app and confirm background is solid black with no color variations
- [x] **Verification**: Enter fullscreen and confirm background remains pure black

## Task 3: Remove vignette overlay effect
- [x] Remove `.player-shell::after` pseudo-element styles that create vignette effect in `client/style.css`
- [x] Remove `.player-shell.vignette-hidden::after` styles in `client/style.css`
- [x] Remove references to `vignette-hidden` class in `client/script.js` (showUI and hideUI functions)
- [x] **Verification**: Play a trailer and confirm no darkening overlay appears on video edges
- [x] **Verification**: Check browser console for no errors related to removed classes

## Task 4: Implement mouse movement detection for UI display
- [x] Add `mousemove` event listener to `document` in `client/script.js`
- [x] In the event handler, call `showUI()` when mouse moves
- [x] Ensure the event handler respects `isManuallyHidden` flag to not override manual toggle
- [x] **Verification**: Hide UI manually, move mouse, and confirm UI appears
- [x] **Verification**: Confirm manual toggle override still works (when manually hidden, mouse movement should not show UI)

## Task 5: Implement inactivity timeout for auto-hide
- [x] Create a `uiTimeout` variable to store timeout ID in `client/script.js`
- [x] In the `mousemove` handler, clear existing timeout and set new 3-second timeout
- [x] When timeout expires, call `hideUI()` to hide the overlay
- [x] Ensure timeout is cleared when UI is shown via manual toggle
- [x] **Verification**: Show UI, stop moving mouse, wait 3 seconds, confirm UI hides automatically
- [x] **Verification**: Move mouse during countdown, confirm timer resets and UI stays visible

## Task 6: Prevent auto-hide during active interaction
- [x] Add event listeners for `mouseenter` on all interactive elements (buttons, dropdowns, controls)
- [x] When mouse enters an interactive element, set a flag `isInteracting = true` and clear the timeout
- [x] Add event listeners for `mouseleave` on interactive elements
- [x] When mouse leaves all interactive elements, set `isInteracting = false` and restart the timeout
- [x] Modify hideUI logic to check `isInteracting` flag before hiding
- [x] **Verification**: Hover over a button, wait 3+ seconds, confirm UI stays visible
- [x] **Verification**: Open genre dropdown, wait 3+ seconds, confirm UI and dropdown stay visible
- [x] **Verification**: Move mouse away from controls, wait 3 seconds, confirm UI hides

## Task 7: Update UI transition timing for smoother animations
- [x] Update `.ui-layer` transition properties in `client/style.css` for refined timing
- [x] Set fade-in transition to 300ms for appearing
- [x] Set fade-out transition to 400ms for disappearing
- [x] Use `cubic-bezier` or `ease-out` timing function for natural feel
- [x] **Verification**: Show/hide UI multiple times and confirm transitions are smooth
- [x] **Verification**: Check for no jarring or jumpy transitions

## Task 8: Test and verify all scenarios
- [x] Test manual UI toggle button still works correctly
- [x] Test that manual hide mode prevents automatic showing on mouse movement
- [x] Test that clicking toggle again re-enables automatic behavior
- [x] Test in fullscreen mode to ensure all behaviors work correctly
- [x] Test on different screen sizes (responsive behavior)
- [x] **Verification**: All manual and automatic controls work as expected
- [x] **Verification**: No console errors appear during interaction
- [x] **Verification**: UI behavior is intuitive and smooth across all test cases

## Dependencies
- Tasks 1-3 (visual refinements) can be done in parallel
- Task 4 must be completed before Task 5
- Task 5 must be completed before Task 6
- Task 7 can be done in parallel with Tasks 4-6
- Task 8 must be done last after all other tasks are complete
