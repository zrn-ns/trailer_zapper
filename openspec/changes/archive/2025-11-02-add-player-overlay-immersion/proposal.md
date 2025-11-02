# Proposal: Add Player Overlay Immersion

## Why

The YouTube IFrame player displays distracting UI elements during video loading and ending states:
- Video title and YouTube logo briefly appear during initial load
- Related video suggestions appear when playback ends
- These elements break the immersive, cinema-like experience

Users should experience seamless trailer playback without seeing YouTube's branding or UI elements, maintaining focus on the content itself.

## What Changes

- Add a player overlay that covers the YouTube IFrame during loading and ending states
- Implement a film grain visual effect on the overlay for a cinematic aesthetic
- Show the overlay when videos are loading or have ended
- Hide the overlay during active playback to allow full video visibility
- Use CSS animations for subtle, authentic film grain texture

## Impact

- Affected specs: `playback-ui` (enhancement)
- Affected code:
  - `client/index.html`: Add player overlay element structure
  - `client/style.css`: Add overlay and film grain styles
  - `client/script.js`: Control overlay visibility based on player state
- User experience: Enhanced immersion by hiding YouTube UI elements
- Performance: Minimal impact (CSS-only film grain animation)
