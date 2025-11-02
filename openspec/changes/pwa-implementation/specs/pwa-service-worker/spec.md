# pwa-service-worker Specification

## Purpose
Implements a Service Worker that caches static assets for improved performance and enables offline access to cached resources while keeping API calls online-only.

## ADDED Requirements

### Requirement: Service Worker Registration

The application SHALL register a Service Worker when running in supported browsers.

#### Scenario: Service Worker registered on load
- **GIVEN** the application loads in a browser that supports Service Workers
- **WHEN** the window.load event fires
- **THEN** navigator.serviceWorker.register('/sw.js') is called
- **AND** registration succeeds without errors
- **AND** the Service Worker scope is logged to console

#### Scenario: Registration fails gracefully
- **GIVEN** Service Worker registration fails (e.g., HTTPS not available)
- **WHEN** the registration promise rejects
- **THEN** the error is logged to console
- **AND** the application continues to function normally
- **AND** no user-facing error is displayed

#### Scenario: Service Worker not supported
- **GIVEN** the browser does not support Service Workers
- **WHEN** checking 'serviceWorker' in navigator
- **THEN** the registration code does not execute
- **AND** the application works without Service Worker
- **AND** no errors occur

### Requirement: Service Worker File

A Service Worker file SHALL be available at /sw.js with caching logic.

#### Scenario: sw.js file exists
- **GIVEN** the application is deployed
- **WHEN** the browser requests /sw.js
- **THEN** a valid JavaScript file is returned
- **AND** the file contains install, activate, and fetch event listeners

#### Scenario: Cache name includes version
- **GIVEN** the sw.js file
- **WHEN** examining the CACHE_NAME constant
- **THEN** it includes a version identifier (e.g., 'trailer-zapper-v1')
- **AND** the version can be incremented for cache invalidation

### Requirement: Install Event - Asset Caching

The Service Worker SHALL cache essential assets during the install event.

#### Scenario: Assets cached on install
- **GIVEN** the Service Worker is being installed
- **WHEN** the install event fires
- **THEN** caches.open() is called with the CACHE_NAME
- **AND** cache.addAll() caches all assets in ASSETS_TO_CACHE array
- **AND** the install event waits for caching to complete

#### Scenario: Cached assets list includes static files
- **GIVEN** the ASSETS_TO_CACHE array
- **WHEN** examining the list
- **THEN** it includes: /, /index.html, /script.js, /style.css, /favicon.ico
- **AND** it includes: /assets/sounds/buzzer.mp3
- **AND** it includes: /assets/theater-background.webp
- **AND** it includes: /assets/tmdb-attribution.svg
- **AND** it includes: /assets/icons/icon-192x192.png, /assets/icons/icon-512x512.png

#### Scenario: YouTube API cached
- **GIVEN** the ASSETS_TO_CACHE array
- **WHEN** examining external resources
- **THEN** https://www.youtube.com/iframe_api is included
- **AND** the YouTube IFrame API is cached for offline availability

#### Scenario: Install completes successfully
- **GIVEN** all assets are cacheable
- **WHEN** the install event completes
- **THEN** self.skipWaiting() is called
- **AND** the new Service Worker activates immediately

#### Scenario: Install handles cache failures
- **GIVEN** one or more assets fail to cache
- **WHEN** cache.addAll() rejects
- **THEN** the install event fails
- **AND** the Service Worker does not activate
- **AND** the error is logged

### Requirement: Activate Event - Cache Cleanup

The Service Worker SHALL remove old caches during the activate event.

#### Scenario: Old caches deleted on activate
- **GIVEN** the Service Worker is activating
- **WHEN** the activate event fires
- **THEN** caches.keys() retrieves all cache names
- **AND** caches not matching CACHE_NAME are deleted
- **AND** only the current version's cache remains

#### Scenario: Activate completes immediately
- **GIVEN** cache cleanup is in progress
- **WHEN** the activate event is processing
- **THEN** event.waitUntil() ensures cleanup completes
- **AND** self.clients.claim() takes control of all clients immediately
- **AND** the new Service Worker starts handling fetches

### Requirement: Fetch Event - Cache-First Strategy

The Service Worker SHALL serve static assets from cache first, falling back to network.

#### Scenario: Static asset served from cache
- **GIVEN** a static asset (e.g., /style.css) is cached
- **WHEN** the browser requests the asset
- **THEN** caches.match() is called first
- **AND** the cached response is returned immediately
- **AND** no network request is made

#### Scenario: Cache miss falls back to network
- **GIVEN** a requested asset is not in cache
- **WHEN** caches.match() returns undefined
- **THEN** fetch(event.request) is called
- **AND** the network response is returned
- **AND** the response is NOT cached (cache remains immutable)

#### Scenario: Static asset paths handled
- **GIVEN** the fetch event listener
- **WHEN** a request for /, /index.html, /script.js, /style.css, or /assets/* occurs
- **THEN** the cache-first strategy is applied
- **AND** cached versions are served if available

### Requirement: Fetch Event - Network-Only Strategy

The Service Worker SHALL bypass cache for API calls, always using the network.

#### Scenario: API calls always use network
- **GIVEN** a request to /api/tmdb/*
- **WHEN** the fetch event fires
- **THEN** caches.match() is NOT called
- **AND** the request goes directly to the network via fetch()
- **AND** the response is NOT cached

#### Scenario: API call failure handled
- **GIVEN** an API request to /api/tmdb/*
- **WHEN** the network request fails
- **THEN** the fetch promise rejects
- **AND** no cached fallback is provided (API requires online)
- **AND** the error propagates to the application

#### Scenario: External API calls not intercepted
- **GIVEN** a request to an external domain (e.g., themoviedb.org)
- **WHEN** the fetch event fires
- **THEN** the Service Worker does not intercept
- **AND** the request passes through normally

### Requirement: Service Worker Lifecycle

The Service Worker SHALL manage its lifecycle correctly across updates.

#### Scenario: New version detects update
- **GIVEN** a new version of sw.js is deployed with updated CACHE_NAME
- **WHEN** the browser checks for updates
- **THEN** the new Service Worker is downloaded
- **AND** the install event fires for the new worker
- **AND** the new cache is created alongside the old one

#### Scenario: Old version remains active until update
- **GIVEN** a new Service Worker is installed but not activated
- **WHEN** the page is still using the old worker
- **THEN** the old Service Worker continues to handle fetches
- **AND** the new worker is in "waiting" state
- **AND** users see the old cached assets until page reload

#### Scenario: Update activates on page reload
- **GIVEN** a new Service Worker is waiting
- **WHEN** the user reloads the page or closes all tabs
- **THEN** the activate event fires for the new worker
- **AND** old caches are deleted
- **AND** new cached assets are used

#### Scenario: skipWaiting forces immediate activation
- **GIVEN** the new Service Worker calls skipWaiting() in install
- **WHEN** installation completes
- **THEN** the new worker activates immediately
- **AND** clients.claim() takes control of existing pages
- **AND** users get the new version without waiting

### Requirement: Service Worker Performance

The Service Worker SHALL optimize performance without degrading user experience.

#### Scenario: Cached assets load faster
- **GIVEN** assets are cached from a previous visit
- **WHEN** the user loads the application
- **THEN** cached assets load from disk (< 10ms)
- **AND** page load time is significantly reduced
- **AND** network requests are minimized

#### Scenario: Cache does not grow unbounded
- **GIVEN** the Service Worker caches a fixed set of assets
- **WHEN** examining cache storage over time
- **THEN** the cache size remains constant (only versioned caches)
- **AND** old caches are deleted on updates
- **AND** storage quota is not exceeded

#### Scenario: Cache strategy does not delay API calls
- **GIVEN** API calls use network-only strategy
- **WHEN** the application makes TMDB API requests
- **THEN** requests proceed directly to the network
- **AND** no cache lookup overhead is incurred
- **AND** API response times are not affected

### Requirement: Service Worker Debugging

The Service Worker SHALL provide logging for debugging and monitoring.

#### Scenario: Install event logged
- **GIVEN** the Service Worker is installing
- **WHEN** the install event fires
- **THEN** a log message is written to console
- **AND** the message indicates installation has started

#### Scenario: Activate event logged
- **GIVEN** the Service Worker is activating
- **WHEN** the activate event fires
- **THEN** a log message is written to console
- **AND** the message indicates which caches were deleted

#### Scenario: Fetch events logged selectively
- **GIVEN** the Service Worker is handling fetch events
- **WHEN** a significant fetch occurs (e.g., cache miss)
- **THEN** a log message is written to console
- **AND** excessive logging does not degrade performance
- **AND** logs are helpful for debugging
