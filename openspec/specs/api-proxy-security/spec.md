# api-proxy-security Specification

## Purpose
TBD - created by archiving change secure-api-keys. Update Purpose after archive.
## Requirements
### Requirement: Proxy Server Implementation

The system SHALL implement an Express.js-based proxy server that relays requests to the TMDB API.

#### Scenario: Basic proxy request to TMDB API

**Given**: The proxy server is running
**When**: The client sends a GET request to `/api/tmdb/discover/movie?page=1`
**Then**: The server forwards the request to TMDB API `https://api.themoviedb.org/3/discover/movie?api_key=xxx&page=1` and returns the response

#### Scenario: Dynamic endpoint path mapping

**Given**: The proxy server is running
**When**: The client sends a GET request to `/api/tmdb/genre/movie/list`
**Then**: The server maps and forwards the request to the TMDB API `/genre/movie/list` endpoint

#### Scenario: Query parameter forwarding

**Given**: The proxy server is running
**When**: The client sends a request to `/api/tmdb/discover/movie?page=2&with_genres=28`
**Then**: The server preserves the query parameters `page=2&with_genres=28`, adds the API key, and forwards to TMDB

### Requirement: Environment Variable API Key Management

The system SHALL manage the API key in a `.env` file and load it at server startup.

#### Scenario: Loading API key from environment variable

**Given**: The `.env` file contains `TMDB_API_KEY=abc123`
**When**: The server starts
**Then**: The server loads the environment variable `TMDB_API_KEY` and uses it for TMDB API requests

#### Scenario: Error when API key is not configured

**Given**: The `.env` file does not contain `TMDB_API_KEY`
**When**: The server starts
**Then**: The server fails to start and displays error message "TMDB_API_KEY is not configured"

#### Scenario: Template provision via .env.example

**Given**: The project contains a `.env.example` file
**When**: A developer performs initial environment setup
**Then**: The developer can copy `.env.example` to create `.env` and set the actual API key

### Requirement: CORS Configuration

The proxy server SHALL allow cross-origin requests from both local development and production environments.

#### Scenario: Request from local development environment

**Given**: The frontend is running at `http://localhost:8000`
**When**: A request is made from `http://localhost:8000` to the proxy server's `/api/tmdb/*`
**Then**: The request is allowed via CORS headers

#### Scenario: Request from production environment

**Given**: The frontend is running at `https://example.com` and is configured in the `ALLOWED_ORIGINS` environment variable
**When**: A request is made from `https://example.com` to the proxy server
**Then**: The request is allowed via CORS headers

### Requirement: Error Handling

The proxy server SHALL properly handle TMDB API errors and server errors, and return them to the client.

#### Scenario: Forwarding TMDB API errors

**Given**: The proxy server is running
**When**: TMDB API returns a 401 Unauthorized error
**Then**: The proxy server forwards status code 401 and error message to the client

#### Scenario: Server internal error

**Given**: The proxy server is running
**When**: An unexpected error occurs during TMDB API request processing
**Then**: The proxy server returns 500 Internal Server Error to the client and logs error details to server logs

#### Scenario: Timeout handling

**Given**: The proxy server is running
**When**: A request to TMDB API does not complete within 10 seconds
**Then**: The proxy server times out the request and returns 504 Gateway Timeout to the client

### Requirement: Security Hardening

The project SHALL prevent API keys from being accidentally committed to the repository through .gitignore configuration.

#### Scenario: Git exclusion of .env file

**Given**: A `.gitignore` file exists
**When**: A `.env` file is created
**Then**: Git excludes the `.env` file from tracking and it does not appear in `git status`

#### Scenario: .env.example is committable

**Given**: A `.env.example` file exists
**When**: `git add` is executed
**Then**: `.env.example` is tracked and can be committed to the repository

### Requirement: Frontend Proxy Integration

The frontend SHALL send all TMDB API requests through the proxy server.

#### Scenario: Discover API call through proxy

**Given**: The frontend can connect to the proxy server
**When**: `fetchFromTMDB('/discover/movie', {page: 1})` is called
**Then**: The request is sent to `http://localhost:3000/api/tmdb/discover/movie?page=1` (API key is not included)

#### Scenario: Genre API call through proxy

**Given**: The frontend can connect to the proxy server
**When**: `fetchFromTMDB('/genre/movie/list')` is called
**Then**: The request is sent to `http://localhost:3000/api/tmdb/genre/movie/list`

#### Scenario: Videos API call through proxy

**Given**: The frontend can connect to the proxy server
**When**: `fetchFromTMDB('/movie/123/videos')` is called
**Then**: The request is sent to `http://localhost:3000/api/tmdb/movie/123/videos`

#### Scenario: No API key exists on client side

**Given**: Security improvements have been applied
**When**: Client-side code (script.js) is inspected
**Then**: No API key constants or api_key parameter addition logic exists

