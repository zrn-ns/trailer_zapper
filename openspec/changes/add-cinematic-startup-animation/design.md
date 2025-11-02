# Design: Cinematic Startup Animation

## Context

The Trailer Zapper application currently uses a simple modal dialog for startup. The goal is to create a more immersive, theater-like experience that gradually transitions users from the initial page load into the cinematic trailer viewing mode. This must comply with YouTube API's autoplay policy, which requires user interaction before unmuted video playback.

**Constraints:**
- YouTube API requires user interaction for audio-enabled playback
- Must work on modern browsers (Chrome, Firefox, Safari, Edge)
- Should be performant and not block user interaction
- Must maintain accessibility for users who prefer reduced motion

**Stakeholders:**
- End users seeking an immersive movie-watching experience
- Development team maintaining the codebase

## Goals / Non-Goals

**Goals:**
- Create a gradual, theatrical lighting-down effect on page load
- Implement smooth transitions between animation stages
- Maintain compliance with YouTube autoplay policy
- Ensure animations are GPU-accelerated for smooth performance
- Respect user preferences for reduced motion (prefers-reduced-motion)

**Non-Goals:**
- Audio or music during startup (violates autoplay policy)
- Complex 3D animations or WebGL effects
- Customizable animation settings (keep it simple)
- Skip button for animations (animations should be brief)

## Decisions

### Animation Stages

**Decision:** Implement a three-stage animation sequence:

1. **Stage 1: Initial Load (0-1.5s)**
   - Page loads with normal brightness
   - Background gradually darkens via overlay opacity animation
   - Modal content remains visible

2. **Stage 2: Dimmed State (1.5s-2.5s)**
   - Background is darkened to simulate theater lighting down
   - Modal content slightly fades but remains readable
   - "Start" button is prominent and ready for interaction

3. **Stage 3: Transition to Playback (triggered by button click)**
   - Complete fade to dark (0.5s)
   - Modal disappears
   - Video player emerges and begins playback

**Rationale:**
- Gradual transition creates anticipation without feeling sluggish
- Total auto-animation time (~2.5s) is brief enough to not annoy users
- Final stage is user-triggered, maintaining control and API compliance

**Alternatives considered:**
- **Single-stage fade:** Too abrupt, lacks theatrical feel
- **Countdown timer:** Feels forced and may create anxiety
- **Instant dark with spotlight:** Too jarring for initial load

### Technical Implementation

**Decision:** Use CSS animations with JavaScript state management

- CSS keyframes for smooth, GPU-accelerated animations
- CSS transitions for state changes
- JavaScript manages animation timing and state progression
- `prefers-reduced-motion` media query to respect accessibility preferences

**Rationale:**
- CSS animations are more performant than JavaScript animations
- Declarative CSS is easier to maintain and debug
- Browser handles optimization automatically
- Better separation of concerns (styling vs. logic)

**Alternatives considered:**
- **JavaScript-based animation libraries (anime.js, GSAP):** Adds unnecessary dependencies
- **Web Animations API:** Less browser support, more complex
- **Pure JavaScript RAF loop:** More code, harder to maintain

### Timing and Easing

**Decision:** Use the following timing configuration:

```css
/* Stage 1: Gradual dimming */
animation: dim-lights 1.5s ease-out forwards;

/* Stage 2: Hold dimmed state */
/* (no animation, just stable state) */

/* Stage 3: Final fade on button click */
transition: opacity 0.5s ease-in;
```

**Easing functions:**
- `ease-out` for dimming: starts quick, slows down (natural lighting effect)
- `ease-in` for final fade: gradual acceleration into darkness

**Rationale:**
- Total time under 3 seconds prevents user frustration
- Ease-out feels more natural for lighting changes
- Final fade is quick enough to feel responsive to user action

### Accessibility

**Decision:** Respect `prefers-reduced-motion` media query

```css
@media (prefers-reduced-motion: reduce) {
  .start-modal, .dimming-overlay {
    animation: none !important;
    transition: none !important;
  }
}
```

**Rationale:**
- Users with vestibular disorders or motion sensitivity need this
- Industry best practice and WCAG guideline
- Gracefully degrades to instant appearance

## Risks / Trade-offs

### Risk: Animation feels too slow

**Mitigation:**
- Keep total auto-animation under 2.5 seconds
- Make final stage instant on button click
- Test with real users if possible

### Risk: Performance on low-end devices

**Mitigation:**
- Use GPU-accelerated properties (opacity, transform)
- Avoid animating layout properties (width, height, margin)
- Test on lower-end devices

### Risk: Conflicts with existing UI state management

**Mitigation:**
- Integrate animation states into existing `state.hasStarted` flag
- Ensure animations don't interfere with existing modal logic
- Add clear comments in code

### Trade-off: Auto-play animations vs. user control

**Decision:** Prioritize immersion with brief auto-animation, maintain user control for final transition

**Rationale:**
- Brief animations (< 3s) are generally acceptable
- User still has full control over when playback starts
- Can be disabled via `prefers-reduced-motion`

## Migration Plan

**No migration needed** - This is a new feature affecting only the startup flow.

**Rollout:**
1. Implement changes in development environment
2. Test across browsers and devices
3. Deploy to production
4. Monitor for user feedback on animation timing

**Rollback:**
If users report negative experiences:
1. Reduce animation duration by 50%
2. If still problematic, remove auto-animation and make it click-triggered only

## Open Questions

- Should there be a subtle sound effect on button click? (Answer: No, keep it simple and silent until video plays)
- Should animation timing be configurable? (Answer: No, keep it simple for v1)
- Should we add a skip button for users who don't want to wait? (Answer: No, animation is brief enough)
