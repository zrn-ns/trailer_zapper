# Proposal: Refine Playback UI

## Why

The current playback interface has visual elements that distract from the immersive movie-watching experience:

1. **Rounded video corners** create a "window" effect rather than a true cinema screen feeling
2. **Colorful gradient background** (radial gradients with pink/purple hues) draws attention away from the video content
3. **Manual UI toggle** requires explicit button clicks, while modern video players like YouTube and Netflix show controls naturally on mouse movement and hide them during inactivity

Users expect a clean, distraction-free viewing experience similar to actual movie theaters, where the screen is the sole focus with no decorative borders or backgrounds. The UI should appear intuitively when needed and disappear seamlessly when not in use.

## What Changes

### Visual Refinements
- Remove all border-radius from the video player shell to create an edge-to-edge cinema screen appearance
- Replace the colorful gradient background with a pure black (#000000) background to eliminate visual distractions
- Remove vignette effects that create artificial darkening around video edges

### Natural UI Control
- Implement mouse movement detection to automatically show UI overlay
- Add inactivity timeout (3 seconds) to automatically hide UI when mouse stops moving
- Maintain existing manual toggle button as a fallback control
- Smooth fade transitions for UI appearance/disappearance
- UI should remain visible when user is actively interacting (hovering over buttons, dropdowns open, etc.)

## Impact

- Affected specs: `playback-ui` (new capability)
- Affected code:
  - `client/style.css`:
    - Remove/modify `.player-shell` border-radius properties
    - Simplify `.immersive-stage` background to solid black
    - Update `.ui-layer` transition properties for smoother animations
  - `client/script.js`:
    - Add mouse movement event listeners
    - Implement inactivity timeout logic
    - Enhance showUI/hideUI functions to respect active interaction states
- User experience: More immersive, cinema-like viewing with intuitive UI controls
- Performance: Minimal impact (simple event listeners and timeout management)
- Backward compatibility: Existing manual UI toggle button remains functional
