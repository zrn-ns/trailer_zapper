# Implementation Tasks

## Task 1: Add sort order dropdown to HTML
- [ ] Add sort order section in control panel after provider filters
- [ ] Create `<select id="sort-order">` element with all 12 options
- [ ] Use Japanese labels for each option (e.g., "人気順（高い順）")
- [ ] Set default value to "popularity.desc"
- **Verification**: Dropdown appears in control panel with all options

## Task 2: Add sort order state management
- [ ] Add `sortOrder: 'popularity.desc'` to state object
- [ ] Get reference to sort order select element
- [ ] Create `loadSortOrder()` function to restore from localStorage
- [ ] Create `saveSortOrder()` function to persist to localStorage
- **Verification**: Sort order state is initialized correctly

## Task 3: Load and apply saved sort order on startup
- [ ] Call `loadSortOrder()` in initialization
- [ ] Set dropdown value to loaded sort order
- [ ] Apply loaded sort order to initial movie fetch
- **Verification**: Saved sort order persists across page reloads

## Task 4: Handle sort order change events
- [ ] Add change event listener to sort order dropdown
- [ ] Update state.sortOrder when changed
- [ ] Call `saveSortOrder()` to persist
- [ ] Reset movie list (clear movies, history, reset page)
- [ ] Fetch fresh movies with new sort order
- **Verification**: Changing sort order updates movie list

## Task 5: Use dynamic sort_by in fetchMovies
- [ ] Replace hardcoded 'popularity.desc' with `state.sortOrder`
- [ ] Ensure sort_by parameter is passed to TMDB API
- **Verification**: API calls use selected sort order

## Task 6: Reset state when sort order changes
- [ ] Clear current movies array
- [ ] Clear history
- [ ] Reset currentMovieIndex to 0
- [ ] Reset currentPage to 1
- [ ] Clear processedMovies set
- **Verification**: Movie list starts fresh with new sort order

## Task 7: Test all sort options
- [ ] Test each of the 12 sort options
- [ ] Verify movies are sorted correctly
- [ ] Verify persistence works for each option
- [ ] Test interaction with provider and genre filters
- **Verification**: All sort options work as expected

## Dependencies
- Tasks 1-2 can be done in parallel (HTML and state setup)
- Task 3 depends on Task 2 (needs state management)
- Task 4 depends on Tasks 2-3 (needs state and load functions)
- Task 5 depends on Task 2 (needs state.sortOrder)
- Task 6 is part of Task 4 logic
- Task 7 must be done last (integration testing)
