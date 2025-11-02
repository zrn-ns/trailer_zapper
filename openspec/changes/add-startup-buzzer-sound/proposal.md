# Proposal: Add Startup Buzzer Sound

## Why

Currently, the startup experience has a visual dimming animation but no audio cue to enhance the theatrical atmosphere. Movie theaters typically play a distinctive buzzer or bell sound at the start of a show to signal that the screening is about to begin.

Adding a buzzer sound when the user clicks "上映開始" will:
- Create a more authentic cinema experience
- Provide audio feedback for the user's action
- Build anticipation before the first trailer begins
- Enhance the overall immersive quality of the application

The sound should play simultaneously with the dimming animation to create a cohesive multi-sensory experience.

## What Changes

- Add buzzer audio file (`opening_buzzer.mp3`) to the project assets
- Play the buzzer sound when the user clicks the "上映開始" button
- Ensure the sound starts at the same moment as the dimming animation begins
- Sound plays once (no loop) and completes naturally

## Impact

- Affected specs: `startup-experience` (new audio requirement)
- Affected code:
  - Add audio asset to `client/assets/sounds/opening_buzzer.mp3`
  - Update `client/script.js` to load and play the buzzer sound on start button click
  - Integrate audio playback with existing dimming animation timing
- User experience: Enhanced theatrical atmosphere with audio-visual coordination
- Performance: Minimal impact (small audio file ~47KB)
- Browser compatibility: Standard HTML5 Audio API (widely supported)
