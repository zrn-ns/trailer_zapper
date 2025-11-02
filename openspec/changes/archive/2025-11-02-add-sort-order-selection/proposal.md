# Proposal: Add Sort Order Selection

## Why

Currently, the movie discovery is limited to a single sort order (`popularity.desc`), which means users always see movies ordered by popularity in descending order. This restricts users from discovering movies in other meaningful ways:

- Users cannot discover newly released movies (release date order)
- Users cannot find highly-rated hidden gems (rating order)
- Users cannot explore by alphabetical order or other criteria

The TMDB API supports 7 different sort criteria (popularity, release_date, revenue, vote_average, vote_count, original_title, primary_release_date), each with ascending and descending options, providing 14 total sorting possibilities.

Users should be able to choose how they want to discover movies, enabling different browsing experiences based on their current interest.

## What Changes

- Add a dropdown/select element in the control panel for choosing sort order
- Provide all 12 useful sort options from TMDB API:
  - Popularity (high/low)
  - Release Date (newest/oldest)
  - Rating (high/low)
  - Vote Count (most/least voted)
  - Revenue (high/low)
  - Title (A-Z/Z-A)
- Store selected sort order in localStorage for persistence across sessions
- Apply selected sort order to movie fetching API calls
- Reset movie list when sort order changes to show fresh results

## Impact

- Affected specs: `movie-filtering` (new capability)
- Affected code:
  - `client/index.html`: Add sort order dropdown in control panel
  - `client/script.js`:
    - Add sort order state management
    - Add event listener for sort order changes
    - Use dynamic sort_by parameter in fetchMovies()
    - Persist sort order to localStorage
- User experience: Greater control over movie discovery
- API impact: No additional API calls, just different parameters
- Performance: No significant impact
