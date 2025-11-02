# Design: API Key Security Implementation

## Problem Definition

Currently, the TMDB API key is hardcoded in `script.js:9`, creating the following security risks:

1. **API Key Exposure**: Included in client-side JavaScript, viewable by anyone through browser developer tools
2. **Abuse Risk**: Third parties can obtain the exposed API key and consume rate limits or misuse it
3. **Key Rotation Difficulty**: Changing the API key requires JavaScript file redistribution

## Architecture Selection

### Approaches Considered

#### 1. Simple Backend Proxy (Adopted)

**Overview**: Introduce a lightweight proxy server using Express.js and manage API key on the server side.

**Advantages**:
- ✅ API key is completely protected on the server side
- ✅ Same codebase works in both local development and production
- ✅ Can coexist with existing development environment (Python/PHP server)
- ✅ Simple configuration, easy to understand
- ✅ Easy to extend with future features (caching, rate limiting, etc.)

**Disadvantages**:
- ❌ Requires server startup and management
- ❌ Hosting environment needs Node.js

**Implementation Details**:
```
Frontend (script.js)
    ↓ HTTP Request
Express.js Proxy (/api/tmdb/*)
    ↓ HTTP Request (with API Key)
TMDB API
```

#### 2. Serverless Functions (Considered but Not Adopted)

**Overview**: Use Netlify Functions or Vercel Functions.

**Advantages**:
- ✅ No server management required
- ✅ Auto-scaling
- ✅ CDN integration

**Disadvantages**:
- ❌ Dependency on specific hosting platform
- ❌ Additional setup required for local development
- ❌ Conflicts with current static hosting requirements

**Reason Not Adopted**: Prioritized universality to work in any environment, avoiding platform dependency.

#### 3. Cloudflare Workers (Considered but Not Adopted)

**Overview**: Lightweight proxy running at the edge.

**Advantages**:
- ✅ Low latency
- ✅ Global distribution

**Disadvantages**:
- ❌ Dependency on Cloudflare environment
- ❌ Workers-specific constraints (execution time, memory, etc.)
- ❌ Higher learning curve

**Reason Not Adopted**: Prioritized simplicity and universality.

## Detailed Architecture of Selected Approach

### Directory Structure

```
trailer_zapper/
├── client/              # Frontend files (existing)
│   ├── index.html
│   ├── script.js
│   └── style.css
├── server/              # New: Backend proxy
│   ├── index.js         # Express server
│   ├── package.json     # Dependency definitions
│   └── .env.example     # Environment variable template
├── .env                 # API key (.gitignore added)
└── package.json         # Root-level script definitions
```

### API Endpoint Design

Proxy server provides the following endpoints:

```
GET /api/tmdb/*
```

- The `*` path portion maps to TMDB API endpoint
- Query parameters are forwarded as-is
- API key is automatically added on server side

**Example**:
```
Frontend: GET /api/tmdb/discover/movie?page=1
     ↓
Proxy: GET https://api.themoviedb.org/3/discover/movie?api_key=xxx&page=1
```

### Environment Variable Management

- Manage API key in `.env` file
- Load with `dotenv` package
- Add `.env` to `.gitignore`
- Provide template with `.env.example`

### CORS Configuration

Implement appropriate CORS settings to ensure operation in development environment:
- Local development: Allow `localhost:8000`
- Production: Set actual domain via environment variable

### Error Handling

1. **TMDB API Errors**: Return status code and error message as-is
2. **Server Errors**: Return 500 error with generic message (details in logs only)
3. **Timeout**: 10-second timeout

## Security Considerations

1. **API Key Protection**:
   - Manage only in server-side environment variables
   - Never expose to client

2. **Rate Limiting**:
   - Not introduced in initial implementation
   - Can be implemented with express-rate-limit in the future

3. **Input Validation**:
   - Basic validation of query parameters
   - Prevent malicious requests

4. **.env Git Management**:
   - Add `.env` to `.gitignore`
   - Document required variables in `.env.example`

## Performance Considerations

1. **Response Time**:
   - Proxy overhead is minimal (< 10ms)
   - TMDB API response time is dominant

2. **Caching**:
   - Not introduced in initial implementation
   - Can be implemented with Redis or in-memory cache in the future

## Migration Strategy

1. **Gradual Migration**:
   - Phase 1: Proxy server implementation and testing
   - Phase 2: Frontend refactoring
   - Phase 3: Remove old API key calls

2. **Backward Compatibility**:
   - Both approaches can operate in parallel during development
   - Remove old code after complete migration

## Comparison with Alternatives

| Aspect | Backend Proxy | Serverless | Cloudflare Workers |
|--------|---------------|------------|-------------------|
| Security | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Simplicity | ⭐⭐⭐ | ⭐⭐ | ⭐ |
| Universality | ⭐⭐⭐ | ⭐ | ⭐ |
| Operational Cost | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Extensibility | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ |

**Conclusion**: Considering the project's current state (simple static app) and team skill set (JavaScript), a simple backend proxy is optimal.

## Future Extensibility

The adopted architecture facilitates the following future feature extensions:

1. **Caching**: Cache TMDB API responses with Redis, etc.
2. **Rate Limiting**: Per-user request limits
3. **Analytics**: Track API usage
4. **Authentication**: Add user authentication features
5. **Additional API Integration**: Protect other API keys (YouTube API, etc.) similarly
