````markdown
# Feature Specification: OAuth Integration (Google + LinkedIn)

**Feature ID:** 002
**Feature Name:** OAuth Integration (Google + LinkedIn)
**Sprint:** 1
**Status:** Draft
**Created:** 2026-08-19
**Updated:** 2026-08-20

---

## 1. Feature Overview

### 1.1 Description

This feature adds OAuth 2.0 authentication support for Google and LinkedIn, allowing users to register and log in using their existing social accounts. The integration leverages the existing `@nestjs/social-auth` package, extends it to meet Levora's specific business rules, securely stores OAuth identities, and creates or links user accounts.

### 1.2 Goals

- Enable Google OAuth 2.0 authentication using the existing `nestjs-social-auth` setup.
- Enable LinkedIn OAuth 2.0 authentication using the existing `nestjs-social-auth` setup.
- Securely store OAuth identity information (access tokens, refresh tokens) with AES-256-CBC encryption.
- Create new users automatically from OAuth profile data, setting `isEmailVerified` to `true` and `isDraft` to `true` for the user profile.
- Link OAuth accounts to existing users when a matching email is found.
- Reject authentication attempts if the OAuth provider does not return an email address, with a clear error message.

### 1.3 Out of Scope

- OAuth provider configuration UI (admin panel).
- Additional OAuth providers (Facebook, Twitter, etc.).
- Account unlinking/revocation.
- OAuth token refresh flows (handled by provider or `nestjs-social-auth`).

---

## 2. User Stories

| ID        | User Story                                                                                                                                    | Priority  | Related FR |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---------- |
| US-002-01 | As a new user, I want to sign up with Google, so that I don't have to create and remember a new password.                                     | Must-Have | FR-1.2     |
| US-002-02 | As a new user, I want to sign up with LinkedIn, so that I can get started using my existing professional profile.                             | Must-Have | FR-1.3     |
| US-002-03 | As an existing user, I want to log in with Google, so that I can access my account without typing my password.                                | Must-Have | FR-1.2     |
| US-002-04 | As a user, I want my OAuth identity stored securely, so that my social account connection is safe.                                            | Must-Have | NFR-002-02 |
| US-002-05 | As a user signing up with OAuth, I want to be redirected back to the appropriate page after authentication.                                   | Must-Have | Implicit   |
| US-002-06 | As a user, if my email is not provided by the OAuth provider, I want to see a clear error message, so that I understand why the login failed. | Must-Have | FR-002-19  |

---

## 3. Functional Requirements

### 3.1 OAuth Integration

| ID        | Requirement                                                                                       | Priority  |
| --------- | ------------------------------------------------------------------------------------------------- | --------- |
| FR-002-01 | The system shall support Google OAuth 2.0 authentication via the `@nestjs/social-auth` package.   | Must-Have |
| FR-002-02 | The system shall support LinkedIn OAuth 2.0 authentication via the `@nestjs/social-auth` package. | Must-Have |
| FR-002-03 | The system shall provide `GET /auth/google` endpoint to initiate Google OAuth flow.               | Must-Have |
| FR-002-04 | The system shall provide `GET /auth/google/callback` endpoint for Google OAuth callback.          | Must-Have |
| FR-002-05 | The system shall provide `GET /auth/linkedin` endpoint to initiate LinkedIn OAuth flow.           | Must-Have |
| FR-002-06 | The system shall provide `GET /auth/linkedin/callback` endpoint for LinkedIn OAuth callback.      | Must-Have |

### 3.2 User Management

| ID        | Requirement                                                                                                   | Priority  |
| --------- | ------------------------------------------------------------------------------------------------------------- | --------- |
| FR-002-07 | The system shall create a new user account when OAuth authentication succeeds for a new email.                | Must-Have |
| FR-002-08 | The system shall link the OAuth identity to an existing user account when the email matches an existing user. | Must-Have |
| FR-002-09 | The system shall create a `UserProfiles` record for new OAuth users with `isDraft` set to `true`.             | Must-Have |
| FR-002-10 | The system shall set `isEmailVerified` to `true` for all OAuth-authenticated users.                           | Must-Have |
| FR-002-11 | The system shall generate JWT access and refresh tokens for OAuth-authenticated users.                        | Must-Have |
| FR-002-12 | The system shall assign the default role `user` to new OAuth users, ensuring the role exists in the database. | Must-Have |

### 3.3 OAuth Identity Storage

| ID        | Requirement                                                                                                        | Priority  |
| --------- | ------------------------------------------------------------------------------------------------------------------ | --------- |
| FR-002-13 | The system shall store OAuth provider information in the `OauthIdentities` table.                                  | Must-Have |
| FR-002-14 | The system shall store `provider`, `providerUserId`, `accessTokenRef`, and `refreshTokenRef` in `OauthIdentities`. | Must-Have |
| FR-002-15 | The system shall encrypt access and refresh tokens before storage using AES-256-CBC.                               | Must-Have |
| FR-002-16 | The system shall enforce the unique constraint on `(provider, providerUserId)` via the database schema.            | Must-Have |

### 3.4 Error Handling

| ID        | Requirement                                                                                                                                                                                                                                                | Priority  |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| FR-002-17 | The system shall redirect to an appropriate error page or return a JSON error response if OAuth authentication fails (e.g., invalid code, provider error).                                                                                                 | Must-Have |
| FR-002-18 | The system shall log all OAuth authentication failures with sufficient context (provider, user ID if available, error message) for monitoring.                                                                                                             | Must-Have |
| FR-002-19 | If the OAuth provider does not return an email address, the system shall reject the authentication attempt and return a clear error message: "Unable to retrieve email from the provider. Please ensure your email is public or use another login method." | Must-Have |
| FR-002-20 | The system shall handle invalid or missing profile data (e.g., missing name) gracefully without crashing.                                                                                                                                                  | Must-Have |

---

## 4. Non-Functional Requirements

| ID         | Requirement                                                  | Target                                                                            |
| ---------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| NFR-002-01 | OAuth redirect response time (excluding provider round-trip) | < 500ms                                                                           |
| NFR-002-02 | Token storage encryption                                     | AES-256-CBC with a 64-character hex key                                           |
| NFR-002-03 | OAuth error logging                                          | All errors logged with correlation IDs and context                                |
| NFR-002-04 | OAuth flow test coverage                                     | ≥ 80% for custom OAuth service and encryption logic                               |
| NFR-002-05 | Encryption key validation                                    | The system shall validate `OAUTH_ENCRYPTION_KEY` at startup; fail fast if invalid |

---

## 5. Acceptance Criteria

### 5.1 Google OAuth

| ID        | Criterion                                                                                               |
| --------- | ------------------------------------------------------------------------------------------------------- |
| AC-002-01 | `GET /auth/google` redirects to Google's OAuth consent screen with the correct scopes (profile, email). |
| AC-002-02 | `GET /auth/google/callback` processes the callback and authenticates the user.                          |
| AC-002-03 | New users created via Google have `isEmailVerified` set to `true`.                                      |
| AC-002-04 | A `UserProfiles` record is created for new Google OAuth users with `isDraft: true`.                     |
| AC-002-05 | A valid JWT access token is returned after successful Google authentication.                            |
| AC-002-06 | Existing users with a matching email are linked to the Google identity (no duplicate accounts).         |

### 5.2 LinkedIn OAuth

| ID        | Criterion                                                                                                   |
| --------- | ----------------------------------------------------------------------------------------------------------- |
| AC-002-07 | `GET /auth/linkedin` redirects to LinkedIn's OAuth consent screen with the correct scopes (profile, email). |
| AC-002-08 | `GET /auth/linkedin/callback` processes the callback and authenticates the user.                            |
| AC-002-09 | New users created via LinkedIn have `isEmailVerified` set to `true`.                                        |
| AC-002-10 | A `UserProfiles` record is created for new LinkedIn OAuth users with `isDraft: true`.                       |
| AC-002-11 | A valid JWT access token is returned after successful LinkedIn authentication.                              |
| AC-002-12 | Existing users with a matching email are linked to the LinkedIn identity (no duplicate accounts).           |

### 5.3 OAuth Identity Storage & Security

| ID        | Criterion                                                                                      |
| --------- | ---------------------------------------------------------------------------------------------- |
| AC-002-13 | Access tokens are encrypted via `EncryptionService` before being stored in `accessTokenRef`.   |
| AC-002-14 | Refresh tokens are encrypted via `EncryptionService` before being stored in `refreshTokenRef`. |
| AC-002-15 | The `(provider, providerUserId)` combination is unique in the database.                        |
| AC-002-16 | `linkedAt` is correctly set to the current timestamp for new OAuth identities.                 |
| AC-002-17 | Tokens can be decrypted by the system when needed.                                             |

### 5.4 Error Handling

| ID        | Criterion                                                                                                                  |
| --------- | -------------------------------------------------------------------------------------------------------------------------- |
| AC-002-18 | Invalid OAuth callback (e.g., missing code) returns an appropriate error response (4xx).                                   |
| AC-002-19 | Missing email from the OAuth provider returns the error message "Unable to retrieve email..." and the user is not created. |
| AC-002-20 | Database errors during OAuth flow are logged and handled gracefully (returning 500 with a generic message).                |
| AC-002-21 | The default role `user` exists in the `roles` table before any OAuth user creation.                                        |

---

## 6. Dependencies

### 6.1 External Dependencies

| Dependency               | Version    | Purpose                                                          |
| ------------------------ | ---------- | ---------------------------------------------------------------- |
| @nestjs/social-auth      | (existing) | Base OAuth integration for NestJS (Google + LinkedIn strategies) |
| @nestjs/passport         | ^10.0.0    | Passport integration for NestJS                                  |
| passport-google-oauth20  | ^2.0.0     | Google OAuth 2.0 strategy                                        |
| passport-linkedin-oauth2 | ^2.0.0     | LinkedIn OAuth 2.0 strategy                                      |

### 6.2 Internal Dependencies

| Dependency             | Description                                                             |
| ---------------------- | ----------------------------------------------------------------------- |
| Feature 001 (JWT Auth) | JWT authentication system and user/role models must be complete.        |
| Prisma Schema          | `OauthIdentities` table must exist (added in DB v1.2).                  |
| Database Seed          | Default roles (`user`, `content_admin`, `system_admin`) must be seeded. |

---

## 7. Risks and Mitigations

| Risk                                                         | Impact | Mitigation                                                                                                    |
| ------------------------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------- |
| OAuth provider service disruption                            | High   | Implement timeout and retry logic; show user-friendly error messages.                                         |
| Missing email from OAuth provider                            | Medium | Reject the attempt with a clear error; guide user to use another method.                                      |
| Email mismatch (OAuth email different from existing account) | Medium | Linking by email is standard; inform user if an account with that email already exists and link successfully. |
| OAuth provider API changes                                   | Medium | Use well-maintained libraries; monitor provider documentation.                                                |
| Security of stored OAuth tokens                              | High   | Encrypt tokens at rest with AES-256; store encryption key securely (environment variable).                    |

---

## 8. Technical Notes

### 8.1 Environment Variables

| Variable                 | Required | Description                                 |
| ------------------------ | -------- | ------------------------------------------- |
| `GOOGLE_CLIENT_ID`       | Yes      | Google OAuth 2.0 client ID                  |
| `GOOGLE_CLIENT_SECRET`   | Yes      | Google OAuth 2.0 client secret              |
| `GOOGLE_CALLBACK_URL`    | Yes      | Google OAuth callback URL                   |
| `LINKEDIN_CLIENT_ID`     | Yes      | LinkedIn OAuth 2.0 client ID                |
| `LINKEDIN_CLIENT_SECRET` | Yes      | LinkedIn OAuth 2.0 client secret            |
| `LINKEDIN_CALLBACK_URL`  | Yes      | LinkedIn OAuth callback URL                 |
| `OAUTH_ENCRYPTION_KEY`   | Yes      | 64-character hex key for AES-256 encryption |

### 8.2 OAuth Provider Configuration

**Google OAuth Scopes:**

- `profile` - User's profile information
- `email` - User's email address

**LinkedIn OAuth Scopes:**

- `profile` - User's profile information
- `email` - User's email address

### 8.3 OAuth Identity Model (Prisma)

```prisma
model OauthIdentities {
  id              String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId          String    @map("user_id") @db.Uuid
  provider        String    @db.Text
  providerUserId  String    @map("provider_user_id") @db.Text
  accessTokenRef  String?   @map("access_token_ref") @db.Text
  refreshTokenRef String?   @map("refresh_token_ref") @db.Text
  linkedAt        DateTime  @default(now()) @map("linked_at") @db.Timestamptz(6)
  createdAt       DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt       DateTime? @updatedAt @map("updated_at") @db.Timestamptz(6)

  user            Users     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerUserId])
  @@map("oauth_identities")
}
```
````

### 8.4 OAuth Flow Response

After successful OAuth authentication, the system should redirect to the frontend with JWT tokens (via query parameters) or return them in a JSON response, depending on the frontend architecture (SPA vs. SSR).

### 8.5 Reference Documents

- Levora Database Design v1.2 (OauthIdentities table)
- System Architecture Design v2.0
- AGENTS.md (Project rules and guidelines)
- SRS v1.0 (Section 3.1: Authentication & Account Management)

```

```
