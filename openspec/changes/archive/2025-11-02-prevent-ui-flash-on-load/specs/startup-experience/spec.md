# startup-experience Specification Delta

## MODIFIED Requirements

### Requirement: Initial UI State

The UI layer SHALL be hidden from the moment the HTML is rendered, before JavaScript execution.

#### Scenario: UI layer has startup-hidden class in HTML
- **GIVEN** the HTML document is being parsed
- **WHEN** the `.ui-layer` element is rendered
- **THEN** the element has the `startup-hidden` class applied inline
- **AND** the UI is not visible to the user
- **AND** this state persists until JavaScript removes the class

#### Scenario: No UI flash during initial load
- **GIVEN** the user is visiting the site for the first time
- **WHEN** images and resources are loading
- **THEN** the overlay UI remains hidden
- **AND** no visual content from the UI layer is visible
- **AND** the user only sees the start modal

#### Scenario: UI remains hidden on slow networks
- **GIVEN** the user is on a slow network connection (e.g., Slow 3G)
- **WHEN** the page is loading
- **THEN** the UI layer remains completely hidden
- **AND** no flickering or flash of UI content occurs
- **AND** the startup-hidden class prevents any visibility

#### Scenario: JavaScript redundantly adds startup-hidden
- **GIVEN** the HTML already has `startup-hidden` class on `.ui-layer`
- **WHEN** JavaScript executes and adds `startup-hidden` class again
- **THEN** the operation is redundant but harmless
- **AND** the class remains on the element
- **AND** backward compatibility is maintained
