# Implementation Tasks

## Task 1: Add player overlay HTML structure
- [x] Add `#player-overlay` element to `client/index.html`
- [x] Add `.film-grain` child element for visual effect
- [x] Position overlay within `.player-shell` container
- **Verification**: Overlay element exists in DOM

## Task 2: Style player overlay with CSS
- [x] Create `.player-overlay` styles with absolute positioning
- [x] Set z-index to 10 (above video player)
- [x] Add black background and transition effects
- [x] Implement `.hidden` state (opacity 0, pointer-events none)
- **Verification**: Overlay covers player when visible

## Task 3: Implement film grain visual effect
- [x] Create `.film-grain` styles using repeating-linear-gradient
- [x] Add subtle grain texture (opacity 0.4)
- [x] Implement grain animation (0.2s steps)
- [x] Add pseudo-element for additional texture variation
- **Verification**: Film grain visible and animating smoothly

## Task 4: Control overlay visibility in JavaScript
- [x] Get reference to `playerOverlay` element in `client/script.js`
- [x] Show overlay in `displayTrailer()` function (video loading)
- [x] Hide overlay in `handleYoutubeStateChange()` when PLAYING
- [x] Show overlay in `handleYoutubeStateChange()` when ENDED
- **Verification**: Overlay appears during load/end, hides during playback

## Task 5: Test across player states
- [x] Verify overlay appears when loading new video
- [x] Verify overlay hides smoothly when playback starts
- [x] Verify overlay reappears when video ends
- [x] Test transition timing (300ms fade)
- **Verification**: Smooth transitions, no YouTube UI visible

## Dependencies
- Tasks 1-2 are foundational (HTML/CSS structure)
- Task 3 depends on Task 2 (overlay must exist for film grain)
- Task 4 depends on Tasks 1-3 (requires complete overlay implementation)
- Task 5 is final verification
