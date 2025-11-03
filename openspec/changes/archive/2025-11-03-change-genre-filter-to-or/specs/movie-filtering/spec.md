# movie-filtering Specification Deltas

## MODIFIED Requirements

### Requirement: Sort Order Interaction with Filters

Sort order SHALL work in combination with provider and genre filters. This requirement is modified to clarify that genre filters use OR logic.

#### Scenario: Sort order applies with genre filters
- **GIVEN** genre filters are selected
- **WHEN** applying the sort order
- **THEN** movies are fetched matching **any of the selected genres** (OR logic) AND the sort order
- **AND** the TMDB API `with_genres` parameter uses pipe-separated values (e.g., "28|12|16")

#### Scenario: Multiple genre selection returns broader results
- **GIVEN** multiple genres are selected (e.g., "Action" and "Comedy")
- **WHEN** the user clicks the "Apply" button
- **THEN** movies matching **any of the selected genres** are displayed
- **AND** the result includes movies that are Action OR Comedy (not necessarily both)
- **AND** more movies are shown compared to AND logic

#### Scenario: Genre filter UI explains OR behavior
- **GIVEN** the user opens the genre filter modal
- **WHEN** viewing the modal
- **THEN** an explanation text is displayed
- **AND** the text clearly states that movies matching **any** of the selected genres will be shown
- **AND** the text reads: "チェックを入れたジャンルのいずれかに該当する映画が表示されます。"
