# Tasks for expand-streaming-services-with-deferred-filtering

## Phase 1: Data Model & Constants

- [ ] Add new provider IDs to PROVIDER_IDS constant in script.js
  - Add HULU: '15'
  - Add U_NEXT: '84'
  - Add DISNEY_PLUS: '337'
  - Add APPLE_TV_PLUS: '350'
  - **Validation**: Verify constant object has 6 entries

## Phase 2: HTML Structure

- [ ] Add HTML checkboxes for new providers in index.html
  - Add Hulu checkbox with id="hulu-filter" value="15"
  - Add U-NEXT checkbox with id="u-next-filter" value="84"
  - Add Disney Plus checkbox with id="disney-plus-filter" value="337"
  - Add Apple TV+ checkbox with id="apple-tv-plus-filter" value="350"
  - All new checkboxes have `checked` attribute (default selected)
  - **Validation**: Verify 6 checkboxes render in browser

- [ ] Add Apply and Reset buttons to control panel in index.html
  - Add "適用" button with id="apply-filters-button" class="primary-button"
  - Add "リセット" button with id="reset-filters-button" class="ghost-button"
  - Position buttons after the genre filter toggle button
  - **Validation**: Buttons are visible and styled correctly

## Phase 3: State Management

- [ ] Add pending state object to script.js
  - Create `pendingState` object with properties: `providers`, `sortOrder`, `genres`
  - Initialize pendingState from applied state on page load
  - **Validation**: Both states exist and are synchronized on init

- [ ] Add DOM references for new elements in script.js
  - Reference all 4 new provider checkboxes
  - Reference apply-filters-button
  - Reference reset-filters-button
  - **Validation**: All references are non-null after DOM load

- [ ] Implement hasPendingChanges() utility function
  - Compare pendingState.providers with state.selectedProviders
  - Compare pendingState.sortOrder with current sort order
  - Compare pendingState.genres with state.selectedGenres
  - Return true if any difference exists
  - **Validation**: Function correctly detects changes

- [ ] Implement updateButtonStates() function
  - Call hasPendingChanges()
  - Enable/disable Apply button based on result
  - Enable/disable Reset button based on result
  - Add visual indication of pending changes
  - **Validation**: Buttons enable/disable correctly

## Phase 4: Deferred Filter Application

- [ ] Remove immediate application from provider checkbox handlers
  - Remove existing event listeners that call updateAndFetchMovies()
  - Add new event listeners that update pendingState.providers only
  - Call updateButtonStates() after updating pending state
  - **Validation**: Checking/unchecking providers does not trigger API call

- [ ] Remove immediate application from sort order dropdown
  - Remove existing event listener that calls updateAndFetchMovies()
  - Add new event listener that updates pendingState.sortOrder only
  - Call updateButtonStates() after updating pending state
  - **Validation**: Changing sort order does not trigger API call

- [ ] Remove immediate application from genre filter modal
  - Update genre checkbox handlers to update pendingState.genres only
  - Do not call updateAndFetchMovies() from genre modal
  - Call updateButtonStates() after updating pending state
  - **Validation**: Changing genres does not trigger API call

## Phase 5: Apply Button Implementation

- [ ] Implement applyFilters() function
  - Copy pendingState to applied state (state.selectedProviders, etc.)
  - Build selectedProviders array from all 6 checkboxes
  - Validate at least one provider is selected
  - Clear current movies array and history
  - Call updateAndFetchMovies() with new filter state
  - Save to localStorage
  - Disable Apply/Reset buttons after applying
  - **Validation**: Applying filters triggers API call and updates movie list

- [ ] Add Apply button click handler
  - Call applyFilters() on click
  - Handle edge case: no providers selected (show warning)
  - **Validation**: Click applies all pending changes

## Phase 6: Reset Button Implementation

- [ ] Implement resetFilters() function
  - Copy applied state back to pendingState
  - Update UI controls (checkboxes, dropdown) to match applied state
  - Disable Apply/Reset buttons
  - Do NOT call API or update movie list
  - **Validation**: Reset reverts UI to last applied state

- [ ] Add Reset button click handler
  - Call resetFilters() on click
  - **Validation**: Click discards pending changes

## Phase 7: Initialization & Persistence

- [ ] Update provider initialization logic
  - Check localStorage for saved providers
  - If null, default all 6 providers to checked
  - If saved preferences exist, apply them to all 6 checkboxes
  - Initialize both pendingState and applied state
  - **Validation**: First visit has all 6 checked, subsequent visits restore preferences

- [ ] Update localStorage save logic
  - Save only in applyFilters() function
  - Save all 6 provider states as array of IDs
  - Save sort order
  - Save selected genres
  - **Validation**: Only "Apply" click saves to localStorage

- [ ] Update localStorage load logic
  - Load provider preferences for all 6 providers
  - Handle backward compatibility (old data with only 2 providers)
  - Load sort order preference
  - Load genre preferences
  - **Validation**: Preferences persist across page reloads

## Phase 8: UI/UX Polish

- [ ] Update provider filter section styles
  - Adjust layout to accommodate 6 checkboxes
  - Ensure responsive design on mobile
  - Test that all labels are readable
  - **Validation**: UI looks good on desktop and mobile

- [ ] Add visual feedback for pending changes
  - Highlight Apply button when changes are pending
  - Show subtle indicator that filters are "staged"
  - **Validation**: User can clearly see when changes are pending

- [ ] Update panel hint text
  - Update existing hint to mention "適用ボタンをクリックして反映"
  - **Validation**: Hint text is helpful and clear

## Phase 9: Testing & Validation

- [ ] Test all provider combinations
  - Test selecting 1 provider
  - Test selecting all 6 providers
  - Test selecting 0 providers (should show warning)
  - Test each new provider individually
  - **Validation**: All combinations work correctly

- [ ] Test deferred application workflow
  - Change multiple filters without applying
  - Verify no API calls are made
  - Click Apply and verify single API call
  - **Validation**: Deferred application works as expected

- [ ] Test Reset functionality
  - Make multiple changes
  - Click Reset
  - Verify UI reverts without API call
  - **Validation**: Reset discards changes correctly

- [ ] Test Apply/Reset button states
  - Verify buttons are disabled when no changes pending
  - Verify buttons enable when changes are made
  - Verify buttons disable after Apply
  - **Validation**: Button states are always correct

- [ ] Test localStorage persistence
  - Apply filters with various combinations
  - Reload page
  - Verify all preferences are restored
  - **Validation**: Persistence works for all 6 providers

- [ ] Test backward compatibility
  - Use browser dev tools to set old localStorage format (2 providers)
  - Reload page
  - Verify app handles old data gracefully
  - **Validation**: No errors, old preferences are maintained

- [ ] Test edge cases
  - Rapid filter changes
  - Apply with no changes
  - Reset with no changes
  - Close and reopen genre modal without applying
  - **Validation**: All edge cases handled gracefully

## Phase 10: Documentation & Cleanup

- [ ] Add code comments
  - Document pending state structure
  - Document Apply/Reset button logic
  - Document new provider IDs
  - **Validation**: Code is well-documented

- [ ] Remove obsolete code
  - Remove old immediate application logic if any remains
  - Clean up unused variables
  - **Validation**: No dead code remains

- [ ] Update console logs
  - Add helpful logs for filter application
  - Add logs for pending state changes
  - **Validation**: Debugging is easier with clear logs
