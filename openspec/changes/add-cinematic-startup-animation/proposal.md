# Proposal: Add Cinematic Startup Animation

## Why

The current startup modal displays a simple dialog asking "Trailer Zapper を開始しますか？" (Do you want to start Trailer Zapper?), which lacks the immersive, theatrical atmosphere of a movie theater experience. Users should feel the anticipation and immersion of entering a cinema, where lights gradually dim before the movie begins, creating a sense of excitement and focus.

## What Changes

- Add a gradual dimming animation on page load that simulates theater lighting going down
- Transform the startup modal into a cinematic experience with multi-stage fade transitions
- Implement CSS animations and transitions that create a theater-like atmosphere
- Maintain YouTube API compliance by keeping user interaction requirement (button click) for audio playback
- Create smooth visual transitions: initial light state → gradual darkening → complete darkness → video player emergence

## Impact

- Affected specs: `startup-experience` (new capability)
- Affected code:
  - `client/index.html`: Modify startup modal structure
  - `client/style.css`: Add new animation keyframes and transition styles
  - `client/script.js`: Enhance startup flow with staged animations
- User experience: Enhanced immersion and theatrical atmosphere
- Technical constraints: Respects YouTube autoplay policy (requires user interaction for unmuted playback)
