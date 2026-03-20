# FluxBT Login Design

## Background

FluxBT currently renders the full application shell directly from [`src/app/page.tsx`](C:\Users\MIKUxICE\Desktop\Projects\playgrounds\codex-playground\fluxbt\src\app\page.tsx) and does not have any authentication flow. The repository already includes `next-auth`, Prisma, and a basic `User` model, so the smallest maintainable solution is to add local username/password authentication on top of the existing stack instead of introducing a new auth system.

## Confirmed Requirements

- Use application-owned accounts instead of third-party identity providers
- Allow users to self-register
- Use `username + password` for authentication
- Do not enforce password complexity because the app is intended for local self-hosted use
- Protect the whole application so unauthenticated users are redirected to the login page
- Keep the existing dashboard UX as the post-login experience

## Options Considered

### Option 1: `next-auth` Credentials Provider + JWT session

Pros:

- Reuses an existing dependency
- Requires the fewest schema changes
- No server-side session table is needed
- Middleware-based route protection stays simple

Cons:

- Session invalidation is coarser than database-backed sessions

### Option 2: `next-auth` Credentials Provider + Prisma Adapter + database sessions

Pros:

- Sessions become queryable and revocable from the database
- Easier to extend into admin session management later

Cons:

- Requires several extra auth tables that do not add value for the current local-only use case
- More moving pieces to maintain

### Option 3: Custom cookies/session implementation

Pros:

- Maximum control

Cons:

- Reinvents security-sensitive behavior already covered by `next-auth`
- Highest maintenance burden

## Recommended Approach

Use Option 1: `next-auth` Credentials Provider with JWT sessions.

This gives FluxBT a straightforward local auth flow with minimal surface area:

- Prisma stores local users with a hashed password
- `next-auth` handles sign-in, sign-out, JWT/session callbacks, and middleware integration
- App pages stay server-protected while the existing client-heavy dashboard UI remains unchanged

## Route and Component Design

### Public routes

- `/login`: username/password sign-in page
- `/register`: username/password registration page
- `/api/auth/[...nextauth]`: `next-auth` route handler
- `/api/auth/register`: local registration endpoint

### Protected routes

- `/`: existing FluxBT application shell
- Any future app pages under the main application namespace

### Component structure

- Keep the current interactive dashboard logic in a client component
- Change [`src/app/page.tsx`](C:\Users\MIKUxICE\Desktop\Projects\playgrounds\codex-playground\fluxbt\src\app\page.tsx) into a server page that checks the session first
- Add dedicated auth form components for login and registration pages
- Add a logout action inside the existing settings menu so the auth flow is complete

## Data Model Changes

The current Prisma `User` model is not sufficient for local auth because it requires `email` and has no password field.

Planned shape:

```prisma
model User {
  id           String   @id @default(cuid())
  username     String   @unique
  passwordHash String
  name         String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

Notes:

- Remove the required `email` field because it is not part of the confirmed UX
- Store only the hash, never the plaintext password
- Use a pure-JS hash library such as `bcryptjs` to keep local development simple on Windows

## Auth Flow

### Registration flow

1. User opens `/register`
2. Client validates `username`, `password`, and `confirmPassword`
3. Client sends `POST /api/auth/register`
4. Server validates the payload with `zod`
5. Server rejects duplicate usernames
6. Server hashes the password and creates the Prisma user
7. Client immediately calls `signIn("credentials")`
8. On success, redirect to `/`

### Login flow

1. User opens `/login`
2. Client submits `username + password`
3. `next-auth` Credentials provider looks up the user by `username`
4. Password hash is verified
5. On success, `id`, `username`, and optional `name` are written into JWT and session
6. User is redirected to `/`

### Route protection flow

1. `middleware.ts` checks the auth token for all app routes
2. Public auth pages and auth APIs are excluded
3. Unauthenticated requests to protected routes redirect to `/login`
4. Authenticated requests to `/login` or `/register` redirect back to `/`

## Error Handling

### Registration errors

- Empty username
- Empty password
- Password mismatch
- Username already exists

### Login errors

- Unknown username
- Wrong password

### UX behavior

- Server responses use clear status codes and concise error messages
- UI shows user-friendly messages without exposing internal details
- No secrets or raw credentials are logged

## Testing Strategy

The repository currently has no test runner, so the implementation should add a small focused unit-test setup.

### Automated coverage

- Password hashing helper
- Registration validation and duplicate username handling
- Credentials authorization logic
- Public/protected route helper logic when extracted into testable functions

### Manual verification

- Register a new user and land on `/`
- Log out and confirm redirect to `/login`
- Log back in with the same credentials
- Confirm unauthenticated access to `/` redirects to `/login`

## Security and Deployment Notes

- The runtime must read `NEXTAUTH_SECRET` from environment variables
- No secret should be committed to the repository
- Because this is a local-only deployment, password complexity stays intentionally minimal
- Even in local mode, passwords must still be hashed and compared securely

## Non-Goals

- Email verification
- Password reset
- Roles and permissions
- Multi-factor authentication
- Admin user management
