# Implementation Tasks: Add Mobile Responsiveness

## Task 1: Add Safe Area support in HTML
- [x] Add iOS viewport meta tags for Safe Area in `client/index.html`
- [x] Add `viewport-fit=cover` to enable Safe Area insets
- **Verification**: Load on iOS device and confirm proper spacing around notch

## Task 2: Implement touch device detection
- [x] Add touch capability detection in `client/script.js` (check `'ontouchstart' in window`)
- [x] Store result in global `state.isTouchDevice` flag
- **Verification**: Log detection result on mobile and desktop
- **Verification**: Confirm correct detection on various devices

## Task 3: Add touch event listeners for UI control
- [x] Modify `setupUIControls()` to add touch event listeners (`touchstart`, `touchmove`)
- [x] Ensure touch events trigger UI show/hide alongside mouse events
- [x] Prevent event conflicts between mouse and touch
- **Verification**: Touch screen to show UI on mobile
- **Verification**: UI hides after 3 seconds of no touch
- **Verification**: No double-triggering on hybrid devices

## Task 4: Implement swipe gesture detection
- [x] Create `setupSwipeGestures()` function in `client/script.js`
- [x] Listen for `touchstart`, `touchmove`, `touchend` on video player area
- [x] Calculate swipe direction and distance (minimum 50px horizontal)
- [x] Call appropriate navigation function (next/previous) on valid swipe
- [x] Prevent swipe during UI interaction (buttons, dropdowns)
- **Verification**: Swipe left loads next video
- **Verification**: Swipe right loads previous video
- **Verification**: Vertical swipes don't trigger navigation
- **Verification**: Swipes on buttons/controls don't trigger navigation

## Task 5: Increase touch target sizes for mobile
- [x] Update button styles in `client/style.css` for mobile breakpoint
- [x] Set minimum size 44x44px for all interactive elements at `@media (max-width: 720px)`
- [x] Increase UI toggle button to 48x48px on mobile
- [x] Add adequate spacing (8px+) between touch targets
- **Verification**: Measure button sizes on mobile (use browser DevTools)
- **Verification**: Easily tap all buttons without mis-taps
- **Verification**: Spacing prevents accidental adjacent taps

## Task 6: Add iOS Safe Area CSS variables
- [x] Add Safe Area padding using `env(safe-area-inset-*)` in `client/style.css`
- [x] Apply to `.ui-layer`, `.ui-toggle-button`, and other edge-positioned elements
- **Verification**: Load on iPhone with notch (or simulator)
- **Verification**: UI elements don't overlap notch or home indicator
- **Verification**: Adequate padding on all edges

## Task 7: Disable keyboard shortcuts on touch devices
- [x] Modify `handleKeyboardShortcuts()` to check `state.isTouchDevice`
- [x] Disable shortcuts (Space, N, P, F, H) on touch-only devices
- [x] Keep essential shortcuts (Escape) if external keyboard detected
- **Verification**: Keyboard shortcuts don't work on mobile
- **Verification**: Shortcuts still work on desktop
- **Verification**: Shortcuts work on iPad with external keyboard

## Task 8: Optimize video player for mobile
- [x] Adjust video player sizing at mobile breakpoint in `client/style.css`
- [x] Ensure 16:9 aspect ratio is maintained
- [x] Add CSS for better fullscreen behavior on iOS
- [x] Handle webkit-specific properties if needed
- **Verification**: Video scales properly on various mobile screen sizes
- **Verification**: Portrait and landscape orientations both work
- **Verification**: Fullscreen works on iOS Safari

## Task 9: Handle orientation changes
- [x] Add `orientationchange` or `resize` event listener in `client/script.js`
- [x] Recalculate layouts when orientation changes
- [x] Ensure UI remains accessible in both orientations
- **Verification**: Rotate device from portrait to landscape
- **Verification**: Layout adjusts smoothly within 300ms
- **Verification**: All controls remain accessible

## Task 10: Add visual feedback for swipe gestures (optional enhancement)
- [ ] Create subtle animation/indicator during swipe
- [ ] Show direction hint (arrow or progress bar)
- [ ] Fade out after swipe completes
- **Verification**: Visual feedback appears during swipe
- **Verification**: Animation is smooth and doesn't lag
- **Verification**: Indicator disappears after action completes

## Task 11: Test on real devices
- [ ] Test on iOS (iPhone, iPad)
- [ ] Test on Android (phone, tablet)
- [ ] Test on hybrid devices (Surface, convertible laptop)
- [ ] Test in portrait and landscape
- **Verification**: All touch interactions work correctly
- **Verification**: Swipe gestures respond accurately
- **Verification**: No performance issues or lag
- **Verification**: Safe Areas respected on notched devices
- **Verification**: Desktop functionality unaffected

## Dependencies
- Tasks 1-2 should be done first (foundational setup)
- Task 3 depends on Task 2 (needs touch detection)
- Task 4 depends on Task 3 (needs touch event infrastructure)
- Tasks 5-6 can be done in parallel with Tasks 3-4
- Task 7 depends on Task 2 (needs device detection)
- Tasks 8-9 can be done in parallel with other tasks
- Task 10 is optional and can be done after Task 4
- Task 11 must be done last after all other tasks are complete
