# Proposal: Add Mobile Responsiveness

## Why

While the application has basic responsive CSS (max-width: 720px), it lacks comprehensive mobile device support:

1. **Touch interaction not optimized** - The application relies primarily on mouse events (mousemove for UI display), which don't translate well to touch devices
2. **Touch target sizes too small** - Many interactive elements don't meet the 44x44px minimum touch target size recommended by Apple and Android
3. **No touch gestures** - Mobile users expect swipe gestures for navigation (swipe left/right for next/previous video)
4. **Keyboard shortcuts conflict** - Keyboard shortcuts designed for desktop (Space, N, P, F, H) may interfere with mobile browser behavior
5. **Safe Area not considered** - iOS devices with notches/home indicators need Safe Area insets for proper spacing
6. **Orientation changes unhandled** - Portrait vs. landscape mode transitions need specific handling
7. **Mobile fullscreen API differences** - iOS Safari handles fullscreen differently than desktop browsers

Users accessing the application from smartphones or tablets currently experience suboptimal usability, limiting the app's accessibility and reach.

## What Changes

### Touch Interaction Support
- Add touch event listeners alongside mouse events for UI control
- Implement touch-friendly UI auto-show/hide (touchstart/touchmove for showing UI)
- Ensure inactivity timeout works with touch interactions
- Handle both mouse and touch events gracefully without conflicts

### Touch-Optimized UI Elements
- Increase button sizes on mobile (minimum 44x44px)
- Add larger tap targets for all interactive elements
- Improve spacing between clickable items to prevent mis-taps
- Optimize control panel and info panel layouts for thumb reach zones

### Swipe Gesture Navigation
- Implement swipe left gesture for next video
- Implement swipe right gesture for previous video
- Add visual feedback during swipe (optional animation/indicator)
- Ensure gestures don't conflict with browser navigation

### Mobile-Specific Adjustments
- Disable or adapt keyboard shortcuts on mobile
- Add iOS Safe Area insets (env(safe-area-inset-*))
- Handle orientation changes (portrait/landscape)
- Optimize video player sizing for mobile screens
- Address mobile fullscreen API quirks (especially iOS Safari)

### Progressive Enhancement
- Maintain full desktop functionality
- Detect touch capability and enable mobile features accordingly
- Ensure graceful degradation if certain features aren't supported

## Impact

- Affected specs: `mobile-ui` (new capability)
- Affected code:
  - `client/index.html`: Add Safe Area meta tags
  - `client/style.css`:
    - Add touch-friendly sizes and spacing
    - Add Safe Area padding
    - Improve mobile breakpoints
  - `client/script.js`:
    - Add touch event listeners
    - Implement swipe gesture detection
    - Add mobile/touch device detection
    - Conditionally handle keyboard shortcuts
- User experience: Mobile users gain native app-like experience
- Browser compatibility: Requires touch event support (available in all modern mobile browsers)
- Performance: Minimal impact (simple event listeners)
