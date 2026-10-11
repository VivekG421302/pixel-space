# Auth API contract (Spring Boot + MySQL)

This is what the frontend in `src/auth/` expects from the backend. A dependency-free mock that implements it lives in
`scripts/mock-api.mjs` (`npm run mock:api`), so the UI can be developed and tested before the real service exists.

The app is **guest-first**: everything works without an account. Signing in is optional and exists so progress can be
restored or synced on another device (sync itself is a later step).

## How the pieces fit

| Piece | Where it lives | Why |
|---|---|---|
| Access token (JWT, ~15 min) | JS memory only | Not readable after a page reload and never in `localStorage`, which limits what XSS can steal |
| Refresh token (opaque, 30 days or session) | `httpOnly` cookie set by the backend | JavaScript cannot read it; it is the actual "session" |
| "Had a session" hint | `localStorage.fq_session = "1"` | Non-sensitive flag so guests never call `/refresh` for nothing |

Page load: if the hint is set (or the URL has `?auth=success`), the app calls `POST {{Base Url}}/auth/refresh`. On success it
holds the new access token in memory and shows the user as signed in. The access token is refreshed again at ~80% of its
life, and once automatically after a `401` on a protected call.

## Conventions

- JSON in and out (`Content-Type: application/json`). Timestamps are UTC strings `YYYY-MM-DD HH:mm:ss`.
- Every request is sent with `credentials: "include"` and the header `X-Requested-With: XMLHttpRequest`.
- Errors: `{ "message": "Human readable text", "errors": { "email": "Field specific text" } }` (`errors` optional).
  The UI shows `message` and, when present, `errors.<field>` under the matching field
  (`name`, `email`, `password`).
- Status codes the UI understands: `400` bad request, `401` not signed in / bad credentials, `403` forbidden,
  `409` email already registered, `422` validation failed, `429` too many attempts (include `Retry-After`), `5xx` server problem.
- User object: the **User DTO** in the README (`id`, `name`, `email`, `provider`, `create-time-stamp`, `update-time-stamp`).
- `{{Base Url}}` is `<backend origin>/api/v1`. The app builds it from `VITE_API_BASE_URL` plus the fixed `/api/v1` prefix.

## Endpoints

### `POST {{Base Url}}/auth/signup`
Request `{ "name": "Ash", "email": "ash@example.com", "password": "Sunrise2026" }`.
`201` `{ "accessToken": "<jwt>", "expiresIn": 900, "user": { ... } }` and `Set-Cookie` for the refresh token.
`409` if the email is taken, `422` with `errors` if invalid.

### `POST {{Base Url}}/auth/login`
Request `{ "email": "...", "password": "...", "remember": true }`.
`200` same body as signup, plus the refresh cookie. `remember: true` means a persistent cookie (30 days); `false` means a
session cookie. `401` with the **same** message for unknown email and wrong password (`"Incorrect email or password."`).
Rate limit per IP and per email (`429`).

### `POST {{Base Url}}/auth/refresh`
No body. Reads the refresh cookie. Requires `X-Requested-With`. `200` same body as login with a **rotated** refresh cookie;
the old refresh token becomes invalid. `401` (and clear the cookie) if missing, expired or already used. If an already-used
token is presented, revoke that user's whole token family (reuse detection).

### `POST {{Base Url}}/auth/logout`
No body. Requires `X-Requested-With`. Revoke the refresh token and clear the cookie. `204`.

### `GET {{Base Url}}/auth/me`
`Authorization: Bearer <accessToken>`. `200` user object, `401` otherwise. (The UI uses it only if `refresh` returns no `user`.)

### `POST {{Base Url}}/auth/forgot-password`
Request `{ "email": "..." }`. **Always** `202 { "message": "..." }`, whether or not the account exists, so the endpoint
cannot be used to discover registered emails. If the account exists and has a password, send the reset email (below).
Rate limit per IP and per email.

### `POST {{Base Url}}/auth/reset-password`
Request `{ "token": "<from the email link>", "password": "NewPassw0rd" }`. `204` on success. `400` with
`"This reset link is invalid or has expired."` for an unknown, expired or used token (the UI then offers a new link).
`422` with `errors.password` for a weak password. On success: mark the token used and **revoke every refresh token** for the user.

### OAuth2 sign-in (Google, GitHub)
Server-side flow with Spring Security `oauth2Login()`. The browser is sent to
`GET {{Base Url}}/auth/oauth2/authorization/{provider}` (set `authorizationEndpoint().baseUri("/api/v1/auth/oauth2/authorization")`), the provider redirects back to
`{{Base Url}}/auth/oauth2/callback/{provider}` (`redirectionEndpoint().baseUri("/api/v1/auth/oauth2/callback/*")`), and your success handler:

1. Finds or creates the user (link by **verified** provider email; store `provider` and `provider_user_id`).
2. Creates a refresh token and sets the refresh cookie.
3. Redirects to `${APP_URL}/?auth=success`. (Never put tokens in the redirect URL.)

On failure redirect to `${APP_URL}/?auth=error&message=<url-encoded short text>`.
The frontend sees `?auth=success`, calls `{{Base Url}}/auth/refresh`, and signs the user in. Enabled buttons are controlled by
`VITE_OAUTH_PROVIDERS`.

## Refresh cookie

```
Set-Cookie: fq_refresh=<opaque>; HttpOnly; Secure; Path=/api/v1/auth; SameSite=Lax; Max-Age=2592000
```

- Preferred setup: serve the API on the **same site** as the app (for example `app.example.com` and `api.example.com`,
  or a reverse-proxy/rewrite so the browser only sees one origin). Then `SameSite=Lax` (or `Strict`) is enough.
- If the API is on a different site, use `SameSite=None; Secure`, an exact-origin CORS allow-list, and keep the
  `X-Requested-With` check. Do not use `*` origins with credentials.
- `Max-Age` omitted for `remember=false` (session cookie). Use `Secure` everywhere except local HTTP development.

CORS (cross-site only): `Access-Control-Allow-Origin: <exact app origin>`, `Access-Control-Allow-Credentials: true`,
`Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With`, methods `GET, POST, OPTIONS`.

## JWT access token

- Short lived (10 to 15 minutes). Claims: `sub` (user id as a string), `iat`, `exp`, optionally `roles`. HS256 with a strong secret,
  or RS256/EdDSA if other services verify it. Validate signature, `exp` and `alg` on every request (reject `none`).
- Stateless on the resource side; the **refresh token** is the revocable part (store only a SHA-256 hash of it in MySQL).

## Password reset email (SMTP)

- Token: 32 random bytes (`SecureRandom`), URL-safe Base64. Store only its SHA-256 hash, `expires_at` (15 to 30 minutes)
  and `used_at`. One active token per user (new request replaces the old one).
- Link in the email: `${APP_URL}/?reset=<token>`. The app opens the "New password" screen and removes the token from the
  address bar immediately.
- Spring: `spring-boot-starter-mail`, `JavaMailSender`, `spring.mail.host/port/username/password`,
  `spring.mail.properties.mail.smtp.auth=true`, `...starttls.enable=true`. Send HTML + plain text. Send asynchronously
  (`@Async`) so response time does not reveal whether the account exists.
- Do not log the token or the full link in production.

## Password rules (the UI enforces the same)

8 to 72 characters (BCrypt limit), at least one lower case, one upper case and one digit. Hash with BCrypt (cost 10+) or
Argon2id. Never store or log plain passwords.

## Suggested MySQL schema

```sql
CREATE TABLE users (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(40)  NOT NULL,
  email         VARCHAR(254) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NULL,                -- NULL for OAuth-only accounts
  provider      VARCHAR(20)  NOT NULL DEFAULT 'local',
  email_verified TINYINT(1)  NOT NULL DEFAULT 0,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE oauth_accounts (
  id               BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id          BIGINT    NOT NULL,
  provider         VARCHAR(20) NOT NULL,
  provider_user_id VARCHAR(100) NOT NULL,
  UNIQUE KEY uq_provider_user (provider, provider_user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE refresh_tokens (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT    NOT NULL,
  token_hash  CHAR(64)    NOT NULL UNIQUE,        -- SHA-256 hex of the opaque token
  family_id   CHAR(36)    NOT NULL,               -- for reuse detection
  expires_at  TIMESTAMP   NOT NULL,
  revoked_at  TIMESTAMP   NULL,
  user_agent  VARCHAR(255) NULL,
  created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_rt_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE password_reset_tokens (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id    BIGINT  NOT NULL,
  token_hash CHAR(64)  NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used_at    TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Spring Boot checklist

- Dependencies: `web`, `security`, `oauth2-client`, `data-jpa`, `mysql-connector-j`, `mail`, `validation`, a JWT library
  (`jjwt` or Nimbus), Flyway, and a rate limiter such as Bucket4j.
- `SecurityFilterChain`: stateless (`SessionCreationPolicy.STATELESS`), permit `/api/v1/auth/**` (including the OAuth2 start and callback paths); everything else needs a valid bearer token. Disable form login and the default CSRF for the JSON API
  but keep the `X-Requested-With` check on `/refresh` and `/logout`.
- Add `Retry-After` on `429`. Return generic messages for credential errors. Keep clocks in UTC.
- Add a scheduled job to delete expired refresh and reset tokens.

## Frontend settings

| Variable | Meaning |
|---|---|
| `VITE_API_BASE_URL` | Backend origin, e.g. `https://api.example.com`. Empty means same-origin `/api/...` |
| `VITE_OAUTH_PROVIDERS` | Buttons to show, e.g. `google,github`. Empty hides them |
| `DEV_API_PROXY` | Dev only: where Vite forwards `/api` (default `http://localhost:8080`) |

On Vercel, set `VITE_API_BASE_URL` in the project's environment variables, then redeploy (Vite bakes it in at build time).
