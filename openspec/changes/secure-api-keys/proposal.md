# Proposal: Secure API Keys

## Summary

Completely isolate the TMDB API key from the client-side and enable secure access through an Express.js proxy server. This eliminates the risk of API key exposure and significantly improves security.

## Why

### Current Problem

Currently, the TMDB API key is hardcoded in `script.js:9`, creating the following serious security risks:

1. **API Key Exposure**: Anyone can easily view the API key through browser developer tools
2. **Abuse Risk**: Third parties can obtain the exposed API key and consume rate limits or misuse it
3. **Key Rotation Difficulty**: Changing the API key requires redistributing the JavaScript file, making operations difficult

### Why Address This Now

- Comply with security best practices
- Adhere to TMDB API terms of service (API keys should be properly protected)
- Build foundation for future production deployment
- Reference implementation for adding other external APIs (YouTube API, etc.)

## What Changes

### Proposed Solution

Introduce a lightweight Express.js-based proxy server with the following architecture:

```
Frontend (client/)
    ↓ HTTP Request (/api/tmdb/*)
Express.js Proxy (server/)
    ↓ HTTP Request (with API Key from .env)
TMDB API
```

### Key Changes

1. **Add Proxy Server**: Express.js + dotenv + CORS
2. **Environment Variable Management**: Securely manage API key in `.env` file
3. **Frontend Refactoring**: Access API through proxy
4. **Security Hardening**: Exclude `.env` with `.gitignore`

### Why This Approach

- **Simple**: Minimal changes integrate with existing Vanilla JavaScript project
- **Universal**: Works in any hosting environment (no dependency on serverless functions)
- **Extensible**: Easy to add future caching, rate limiting, and authentication features
- **Low Learning Curve**: Express.js is widely used and team members can easily understand

See `design.md` for detailed design decisions.

## Impact

### Security Improvements

- ✅ API key will not be exposed on the client-side at all
- ✅ Centralized key management in `.env` file
- ✅ Eliminate risk of committing API keys to Git repository

### Developer Experience

- ⚠️ Requires server startup (additional operational overhead)
- ✅ Can launch everything with `npm run dev` (setup is simple)
- ✅ Template provided with `.env.example` (improved onboarding for new developers)

### Performance

- ⚠️ Proxy overhead < 10ms (TMDB API response time is dominant)
- ➡️ Impact on end-user experience is negligible

### Deployment

- ⚠️ Requires Node.js environment (supported by many hosting services)
- ✅ Easy deployment on Heroku, Render, Railway, etc.
- ✅ Same codebase works in local development and production environments

## Alternatives Considered

1. **Serverless Functions (Netlify/Vercel Functions)**
   - Pros: No server management, auto-scaling
   - Cons: Platform dependency, local development complexity
   - Reason not adopted: Prioritized universality and simplicity

2. **Cloudflare Workers**
   - Pros: Low latency at the edge
   - Cons: Cloudflare dependency, learning curve
   - Reason not adopted: Overkill, prioritized simplicity

3. **Build-time Environment Variable Embedding (Vite/Parcel, etc.)**
   - Pros: Manage environment variables with build tools
   - Cons: Still exposed on client-side, not a complete solution
   - Reason not adopted: Security risks remain

See `design.md` for detailed comparison.

## Success Criteria

### Functional Requirements

- [ ] All TMDB API requests work properly through proxy server
- [ ] All existing features (movie search, trailer playback, filtering, etc.) work
- [ ] Can launch with a single `npm run dev` in local development environment

### Security Requirements

- [ ] API key cannot be viewed in browser developer tools
- [ ] No API key exists anywhere in source code
- [ ] `.env` file is not tracked by Git

### Documentation Requirements

- [ ] Clear setup instructions in README.md
- [ ] Required environment variables documented in `.env.example`
- [ ] New developers can set up environment within 30 minutes

## Timeline

Estimated implementation time of approximately 4.5 hours (see `tasks.md` for details):

1. **Week 1**: Phase 1-2 (Proxy server setup and implementation) - 1.5 hours
2. **Week 1**: Phase 3 (Frontend refactoring) - 1 hour
3. **Week 2**: Phase 4-5 (Developer experience improvements and testing) - 1.25 hours
4. **Week 2**: Phase 6 (Documentation and final validation) - 0.5 hours

## Open Questions

1. **Production hosting**: Which platform will be used?
   - Recommended: Render, Railway, Heroku (can start free to low cost)

2. **Environment variable management**: How will `.env` be configured in production?
   - Recommended: Use hosting platform's environment variable configuration feature

3. **Monitoring**: How will proxy server logs and metrics be managed?
   - Initial implementation: console.log (consider introducing logger like Winston in the future)

## Related Changes

None (initial security improvement)

## Reviewers

- @zrn_ns (Project Owner)

## Status

**Proposed** - Awaiting review
