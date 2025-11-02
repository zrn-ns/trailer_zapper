# pwa-manifest Specification

## Purpose
Defines the Web App Manifest configuration and app icons required for Progressive Web App functionality, enabling users to install Trailer Zapper on their device home screen.

## ADDED Requirements

### Requirement: Web App Manifest File

The application SHALL provide a valid Web App Manifest file that defines app metadata and display mode.

#### Scenario: Manifest file exists and is valid
- **GIVEN** the application is deployed
- **WHEN** the browser requests `/manifest.json`
- **THEN** a valid JSON manifest file is returned
- **AND** the manifest includes required fields: name, short_name, start_url, display, icons

#### Scenario: Manifest declares standalone display mode
- **GIVEN** the manifest.json file
- **WHEN** examining the display field
- **THEN** the display property is set to "standalone"
- **AND** this removes browser UI when launched from home screen

#### Scenario: Manifest includes theme colors
- **GIVEN** the manifest.json file
- **WHEN** examining the color properties
- **THEN** background_color is set to "#050914" (matching app background)
- **AND** theme_color is set to "#050914" (for status bar on mobile)

#### Scenario: Manifest supports all orientations
- **GIVEN** the manifest.json file
- **WHEN** examining the orientation property
- **THEN** orientation is set to "any"
- **AND** both portrait and landscape modes are supported

### Requirement: App Icons

The application SHALL provide multiple sizes of app icons for various devices and contexts.

#### Scenario: 192x192 icon exists
- **GIVEN** the manifest.json specifies an icon at 192x192
- **WHEN** the browser requests the icon file
- **THEN** a valid PNG image at `/assets/icons/icon-192x192.png` is returned
- **AND** the image dimensions are exactly 192x192 pixels

#### Scenario: 512x512 icon exists
- **GIVEN** the manifest.json specifies an icon at 512x512
- **WHEN** the browser requests the icon file
- **THEN** a valid PNG image at `/assets/icons/icon-512x512.png` is returned
- **AND** the image dimensions are exactly 512x512 pixels

#### Scenario: Icons support maskable purpose
- **GIVEN** the manifest.json icon definitions
- **WHEN** examining the purpose field
- **THEN** icons include "any maskable" purpose
- **AND** icons work correctly on both iOS and Android

#### Scenario: Icons are optimized
- **GIVEN** the icon image files
- **WHEN** checking file size
- **THEN** each icon is optimized for web delivery
- **AND** file sizes are reasonable (< 50KB for 192px, < 200KB for 512px)

### Requirement: Manifest Linked in HTML

The application SHALL link the manifest file in the HTML head section.

#### Scenario: Manifest link tag exists
- **GIVEN** the client/index.html file
- **WHEN** examining the <head> section
- **THEN** a <link rel="manifest" href="manifest.json"> tag exists
- **AND** the browser can discover the manifest

#### Scenario: Theme color meta tag exists
- **GIVEN** the client/index.html file
- **WHEN** examining the <head> section
- **THEN** a <meta name="theme-color" content="#050914"> tag exists
- **AND** mobile browsers apply the theme color to the status bar

### Requirement: iOS Safari PWA Support

The application SHALL include iOS-specific meta tags for proper PWA behavior on iOS devices.

#### Scenario: iOS web app capable meta tag
- **GIVEN** the client/index.html file
- **WHEN** examining the <head> section
- **THEN** <meta name="apple-mobile-web-app-capable" content="yes"> exists
- **AND** iOS Safari enables standalone mode when added to home screen

#### Scenario: iOS status bar style
- **GIVEN** the client/index.html file
- **WHEN** examining the <head> section
- **THEN** <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"> exists
- **AND** the status bar has a translucent black background in standalone mode

#### Scenario: iOS app title
- **GIVEN** the client/index.html file
- **WHEN** examining the <head> section
- **THEN** <meta name="apple-mobile-web-app-title" content="Trailer Zapper"> exists
- **AND** iOS displays this title under the home screen icon

#### Scenario: iOS touch icon
- **GIVEN** the client/index.html file
- **WHEN** examining the <head> section
- **THEN** <link rel="apple-touch-icon" href="/assets/icons/icon-192x192.png"> exists
- **AND** iOS uses this icon on the home screen

### Requirement: Manifest Validation

The manifest SHALL pass validation tools and meet PWA standards.

#### Scenario: Lighthouse PWA audit passes
- **GIVEN** the application is running
- **WHEN** running a Lighthouse PWA audit
- **THEN** the "Installable" criteria pass
- **AND** the manifest is detected and valid

#### Scenario: Chrome DevTools recognizes manifest
- **GIVEN** the application is open in Chrome
- **WHEN** viewing Application > Manifest in DevTools
- **THEN** the manifest is displayed with all properties
- **AND** no errors or warnings are shown
