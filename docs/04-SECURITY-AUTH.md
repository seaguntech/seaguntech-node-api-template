# Security and Auth Plan

## 1) Auth Model

- Access token (short TTL, bearer)
- Refresh token (longer TTL, rotation enabled)
- Refresh session store in Redis

## 2) Refresh Token Strategy

- Redis key shape: `auth:refresh:<userId>:<sessionId>`
- store hashed refresh token fingerprint
- rotate token on refresh
- revoke current or all sessions on logout policy

## 3) Security Baseline

- Helmet enabled
- Strict CORS per environment
- Rate limit for auth endpoints
- Password hashing with argon2
- Secrets loaded from env and never logged

## 4) Guard and Decorator Plan

- `JwtAccessGuard` for protected APIs
- `JwtRefreshGuard` for token refresh endpoint
- `@CurrentUser()` custom decorator

## 5) Endpoint Plan

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/logout-all` (optional)
- `GET /api/v1/auth/profile`

## 6) Threat Considerations

- replay prevention via rotation and Redis revocation checks
- brute force mitigation via rate limit
- token theft blast-radius reduced by short access TTL

## 7) Security Checklist Per PR

- input validation present
- authz checks present for protected resources
- no secret in logs/responses
- tests include unauthorized and forbidden cases
