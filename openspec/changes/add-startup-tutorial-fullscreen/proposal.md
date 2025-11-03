# Add Startup Tutorial and Fullscreen Prompt

## Why

To enhance the immersive experience by guiding users into a "movie-watching mindset" similar to being in a theater. Users should be encouraged to focus on the trailer experience with minimal distractions, ideally in fullscreen mode. The startup modal should set the tone with cinematic atmosphere and provide clear guidance on how to use the application.

## What Changes

- Add brief cinematic guide text to the startup modal to establish movie-watching atmosphere
- Display keyboard shortcuts reference in the startup modal
- Add a recommendation message encouraging fullscreen viewing
- Add a fullscreen button within the startup modal
- Reorganize modal layout to accommodate the new tutorial content and buttons
- Update modal styling to maintain the theatrical aesthetic while displaying additional information

The changes maintain the existing startup flow (buzzer sound, dimming animation, etc.) while enhancing the pre-viewing experience.

## Impact

- **Affected specs:**
  - `startup-experience` - MODIFIED: Add tutorial content and fullscreen button requirements
  - `start-modal-interaction` - MODIFIED: Add fullscreen button interaction requirements

- **Affected code:**
  - `client/index.html` - Update startup modal HTML structure
  - `client/style.css` - Add styles for tutorial content and fullscreen button
  - `client/script.js` - Add fullscreen button event handler in startup modal

- **User impact:**
  - Users will see more guidance on first visit
  - Users can enter fullscreen directly from the startup modal
  - Improved onboarding experience may increase engagement with the fullscreen feature
