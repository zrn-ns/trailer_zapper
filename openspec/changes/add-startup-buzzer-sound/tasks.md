# Implementation Tasks

## Task 1: Add buzzer audio file to project assets
- [x] Create `client/assets/sounds/` directory if it doesn't exist
- [x] Copy `opening_buzzer.mp3` from `/Users/zrn_ns/Downloads/Opening_Buzzer01 2/` to `client/assets/sounds/`
- [x] Verify file is accessible at `/assets/sounds/opening_buzzer.mp3`
- **Verification**: File loads successfully in browser network tab

## Task 2: Create Audio object for buzzer sound
- [x] Add buzzer Audio object initialization in script.js
- [x] Set audio source to `/assets/sounds/opening_buzzer.mp3`
- [x] Preload audio using `audio.load()` during initialization
- [x] Handle audio loading errors gracefully
- **Verification**: Audio object is created and ready before user interaction

## Task 3: Play buzzer sound on start button click
- [x] Add `buzzerAudio.play()` call in start button click handler
- [x] Place audio playback before or at same time as dimming animation starts
- [x] Catch and log any playback errors (without blocking the UI)
- [x] Ensure audio playback happens immediately when button is clicked
- **Verification**: Buzzer sound plays when clicking "上映開始" button

## Task 4: Ensure audio-visual synchronization
- [x] Verify buzzer sound starts at the same moment as dimming animation (T=0)
- [x] Test that audio and animation feel synchronized
- [x] Ensure no perceivable lag between audio and visual effects
- **Verification**: Audio and visual effects start simultaneously

## Task 5: Test audio error handling
- [x] Test behavior when audio file fails to load
- [x] Verify dimming animation still works if audio fails
- [x] Test with browser autoplay restrictions
- [x] Verify graceful degradation (no errors in console)
- **Verification**: Application works correctly even if audio fails

## Task 6: Test across browsers and devices
- [x] Test on Chrome/Edge (desktop)
- [x] Test on Firefox (desktop)
- [x] Test on Safari (desktop and mobile)
- [x] Test on mobile devices (iOS/Android)
- [x] Verify audio respects system/browser volume
- **Verification**: Buzzer sound works consistently across platforms

## Dependencies
- Task 1 must complete before Task 2 (need audio file)
- Task 2 must complete before Task 3 (need Audio object)
- Tasks 4-6 are testing/verification tasks that run after Task 3
- All tasks are sequential in nature
