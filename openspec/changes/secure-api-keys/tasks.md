# Tasks: API Key Security Implementation

## Phase 1: Proxy Server Setup

### 1. Project Structure Organization

- [x] Create `client/` directory and move existing frontend files
  - Move `index.html`, `script.js`, `style.css`, `tmdb-attribution.svg`
- [x] Create `server/` directory
- [x] Update `.gitignore` at root level (add `.env`)

**Validation**: Verify new directory structure with `ls` command

### 2. Server Dependency Setup

- [x] Create `server/package.json`
  - Add `express`, `dotenv`, `cors`, `axios` as dependencies
- [x] Run `npm install` in `server/` directory

**Validation**: Confirm `server/node_modules/` is created and dependencies are installed

### 3. Environment Variable File Creation

- [x] Create `.env.example` at root directory
  - Write template with `TMDB_API_KEY=your_api_key_here`
  - Add `PORT=3000`
  - Add `ALLOWED_ORIGINS=http://localhost:8000`
- [x] Create `.env` file and set actual API key
- [x] Add `.env` to `.gitignore` (verify if already added)

**Validation**: Verify template content with `cat .env.example`, confirm `.env` is ignored with `git status`

## Phase 2: Proxy Server Implementation

### 4. Basic Express Server Creation

- [x] Create `server/index.js`
- [x] Implement basic Express application structure
  - Load environment variables with `dotenv`
  - Verify `TMDB_API_KEY` exists (error if not configured)
  - Configure CORS middleware
  - Listen on port 3000

**Validation**: Confirm server starts without errors with `node server/index.js`

### 5. TMDB API Proxy Endpoint Implementation

- [x] Implement `/api/tmdb/*` endpoint
  - Extract TMDB API endpoint from path parameters
  - Preserve query parameters
  - Make request to TMDB API with `axios` (automatically add API key)
  - Return response to client
- [x] Implement error handling
  - Forward TMDB API errors
  - Proper handling of server errors
  - Timeout setting (10 seconds)

**Validation**: Verify data is returned from TMDB API with `curl http://localhost:3000/api/tmdb/genre/movie/list`

### 6. CORS Configuration Implementation

- [x] Configure `cors` middleware
  - Load allowed origins from `ALLOWED_ORIGINS` environment variable
  - Allow `http://localhost:8000` by default
- [x] Handle preflight requests

**Validation**: Confirm no CORS errors in browser console

## Phase 3: Frontend Refactoring

### 7. Frontend Configuration File Addition

- [x] Create `client/config.js` (or add configuration to `script.js`)
  - Define `API_PROXY_URL` (default: `http://localhost:3000`)
  - Make it changeable based on environment

**Validation**: Verify configuration is correct with `cat client/config.js`

### 8. fetchFromTMDB Function Refactoring

- [x] Remove `TMDB_API_KEY` constant from `script.js`
- [x] Change `API_BASE_URL` to proxy server URL (`http://localhost:3000/api/tmdb`)
- [x] Remove `api_key` parameter addition logic from `fetchFromTMDB` function
- [x] Keep other API request parameters (`language`, `region`, etc.)

**Validation**: Confirm data can be fetched through proxy by calling `fetchFromTMDB` in browser console

### 9. Verify All TMDB API Calls

- [x] Test genre list retrieval
- [x] Test movie search (discover API)
- [x] Test trailer information (videos API)
- [x] Test streaming service information (watch/providers API)

**Validation**: Start application and confirm each feature works correctly

## Phase 4: Developer Experience Improvements

### 10. Add npm Scripts

- [x] Create root-level `package.json` (if it doesn't exist)
- [x] Add the following scripts:
  - `start:server`: Start server
  - `start:client`: Start client development server (Python/PHP)
  - `dev`: Start both concurrently (use `concurrently`)

**Validation**: Confirm both servers start with `npm run dev`

### 11. Update README.md

- [x] Add setup instructions
  - How to create `.env` file
  - Dependency installation procedure
  - How to start servers
- [x] Add environment variable descriptions
- [x] Add troubleshooting section

**Validation**: Confirm a new developer can set up the environment following README.md instructions

## Phase 5: Testing and Validation

### 12. Integration Testing

- [x] Verify error handling when proxy server is not running
- [x] Verify error messages with invalid API key
- [x] Test multiple movie search scenarios
- [x] Verify behavior during network errors

**Validation**: Confirm appropriate error messages are displayed for various error cases

### 13. Security Validation

- [x] Verify API key is not exposed in browser developer tools network tab
- [x] Confirm no API key exists in source code (`grep -r "d6f89a671e8fecb1f7cd6a6d32c66ff1"`)
- [x] Verify `.env` is in `.gitignore` and not tracked by Git

**Validation**: Confirm `.env` doesn't appear in `git status` and API key is not visible in browser

## Phase 6: Documentation and Final Validation

### 14. Update Project Documentation

- [x] Update architecture section of `openspec/project.md`
  - Reflect new directory structure
  - Add proxy server description
- [x] Update development environment setup section of `CLAUDE.md`

**Validation**: Confirm documentation accurately reflects latest implementation

### 15. Final Operational Check

- [x] Copy `.env.example` to create `.env` in clean environment
- [x] Launch entire application with `npm install` and `npm run dev`
- [x] Verify all major features work correctly (movie search, trailer playback, filtering, etc.)

**Validation**: Confirm all features work end-to-end and API key is protected

## Dependencies Between Tasks

- Tasks 1-3 can be executed in parallel
- Tasks 4-6 are sequential (4 → 5 → 6)
- Tasks 7-9 can be executed after Task 6 completes
- Tasks 10-11 can be executed in parallel with other tasks
- Tasks 12-13 execute after Phase 3 completes
- Tasks 14-15 execute last

## Estimated Effort

- Phase 1: 30 minutes
- Phase 2: 1 hour
- Phase 3: 1 hour
- Phase 4: 30 minutes
- Phase 5: 45 minutes
- Phase 6: 30 minutes

**Total**: Approximately 4.5 hours
