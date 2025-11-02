# Implementation Tasks

## Task 1: Add buzzer audio file to project assets
- [ ] Create `client/assets/sounds/` directory if it doesn't exist
- [ ] Copy `opening_buzzer.mp3` from `/Users/zrn_ns/Downloads/Opening_Buzzer01 2/` to `client/assets/sounds/`
- [ ] Verify file is accessible at `/assets/sounds/opening_buzzer.mp3`
- **Verification**: File loads successfully in browser network tab

## Task 2: Create Audio object for buzzer sound
- [ ] Add buzzer Audio object initialization in script.js
- [ ] Set audio source to `/assets/sounds/opening_buzzer.mp3`
- [ ] Preload audio using `audio.load()` during initialization
- [ ] Handle audio loading errors gracefully
- **Verification**: Audio object is created and ready before user interaction

## Task 3: Play buzzer sound on start button click
- [ ] Add `buzzerAudio.play()` call in start button click handler
- [ ] Place audio playback before or at same time as dimming animation starts
- [ ] Catch and log any playback errors (without blocking the UI)
- [ ] Ensure audio playback happens immediately when button is clicked
- **Verification**: Buzzer sound plays when clicking "上映開始" button

## Task 4: Ensure audio-visual synchronization
- [ ] Verify buzzer sound starts at the same moment as dimming animation (T=0)
- [ ] Test that audio and animation feel synchronized
- [ ] Ensure no perceivable lag between audio and visual effects
- **Verification**: Audio and visual effects start simultaneously

## Task 5: Test audio error handling
- [ ] Test behavior when audio file fails to load
- [ ] Verify dimming animation still works if audio fails
- [ ] Test with browser autoplay restrictions
- [ ] Verify graceful degradation (no errors in console)
- **Verification**: Application works correctly even if audio fails

## Task 6: Test across browsers and devices
- [ ] Test on Chrome/Edge (desktop)
- [ ] Test on Firefox (desktop)
- [ ] Test on Safari (desktop and mobile)
- [ ] Test on mobile devices (iOS/Android)
- [ ] Verify audio respects system/browser volume
- **Verification**: Buzzer sound works consistently across platforms

## Dependencies
- Task 1 must complete before Task 2 (need audio file)
- Task 2 must complete before Task 3 (need Audio object)
- Tasks 4-6 are testing/verification tasks that run after Task 3
- All tasks are sequential in nature
