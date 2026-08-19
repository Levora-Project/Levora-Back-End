
```markdown
# Feature Specification: OAuth Integration (Google + LinkedIn)

**Feature ID:** 002
**Feature Name:** OAuth Integration (Google + LinkedIn)
**Sprint:** 1
**Status:** Draft
**Created:** 2026-08-19
**Updated:** 2026-08-19

---

## 1. Feature Overview

### 1.1 Description

This feature adds OAuth 2.0 authentication support for Google and LinkedIn, allowing users to register and log in using their existing social accounts. The integration stores OAuth identities securely, creates new user accounts when needed, and links social accounts to existing email-based accounts when matching emails are found.

### 1.2 Goals

- Enable Google OAuth 2.0 authentication
- Enable LinkedIn OAuth 2.0 authentication
- Securely store OAuth identity information (access tokens, refresh tokens)
- Create new users automatically from OAuth profile data
- Link OAuth accounts to existing users when email matches
- Maintain comprehensive logging and error handling

### 1.3 Out of Scope

- OAuth provider configuration UI (admin panel)
- Additional OAuth providers (Facebook, Twitter, etc.)
- Account unlinking/revocation
- OAuth token refresh flows (handled by provider)

---

## 2. User Stories

| ID | User Story | Priority | Related FR |
|----|------------|----------|------------|
| US-002-01 | As a new user, I want to sign up with Google, so that I don't have to create and remember a new password. | Must-Have | FR-1.2 |
| US-002-02 | As a new user, I want to sign up with LinkedIn, so that I can get started using my existing professional profile. | Must-Have | FR-1.3 |
| US-002-03 | As an existing user, I want to log in with Google, so that I can access my account without typing my password. | Must-Have | FR-1.2 |
| US-002-04 | As a user, I want my OAuth identity stored securely, so that my social account connection is safe. | Must-Have | Implicit |
| US-002-05 | As a user signing up with OAuth, I want to be redirected back to the appropriate page after authentication. | Must-Have | Implicit |

---

## 3. Functional Requirements

### 3.1 OAuth Integration

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-002-01 | The system shall support Google OAuth 2.0 authentication using `passport-google-oauth20`. | Must-Have |
| FR-002-02 | The system shall support LinkedIn OAuth 2.0 authentication using `passport-linkedin-oauth2`. | Must-Have |
| FR-002-03 | The system shall provide `GET /auth/google` endpoint to initiate Google OAuth flow. | Must-Have |
| FR-002-04 | The system shall provide `GET /auth/google/callback` endpoint for Google OAuth callback. | Must-Have |
| FR-002-05 | The system shall provide `GET /auth/linkedin` endpoint to initiate LinkedIn OAuth flow. | Must-Have |
| FR-002-06 | The system shall provide `GET /auth/linkedin/callback` endpoint for LinkedIn OAuth callback. | Must-Have |

### 3.2 User Management

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-002-07 | The system shall create a new user account when OAuth authentication succeeds for a new email. | Must-Have |
| FR-002-08 | The system shall link OAuth identity to an existing user account when the email matches. | Must-Have |
| FR-002-09 | The system shall create a UserProfiles record when a new user is created via OAuth. | Must-Have |
| FR-002-10 | The system shall set `isEmailVerified` to `true` for OAuth-authenticated users. | Must-Have |
| FR-002-11 | The system shall generate JWT tokens for OAuth-authenticated users. | Must-Have |

### 3.3 OAuth Identity Storage

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-002-12 | The system shall store OAuth provider information in `OauthIdentities` table. | Must-Have |
| FR-002-13 | The system shall store `provider`, `providerUserId`, `accessTokenRef`, and `refreshTokenRef` in `OauthIdentities`. | Must-Have |
| FR-002-14 | The system shall encrypt access and refresh tokens before storage. | Must-Have |
| FR-002-15 | The system shall enforce unique constraint on `(provider, providerUserId)`. | Must-Have |

### 3.4 Error Handling

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-002-16 | The system shall redirect to an appropriate error page if OAuth authentication fails. | Must-Have |
| FR-002-17 | The system shall log OAuth authentication failures for monitoring. | Must-Have |
| FR-002-18 | The system shall handle missing or invalid OAuth profile data gracefully. | Must-Have |

---

## 4. Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-002-01 | OAuth redirect response time | < 500ms |
| NFR-002-02 | Token storage encryption | AES-256 encryption |
| NFR-002-03 | OAuth error logging | All errors logged with context |
| NFR-002-04 | OAuth flow test coverage | ≥ 80% for OAuth strategies and service |

---

## 5. Acceptance Criteria

### 5.1 Google OAuth

| ID | Criterion |
|----|-----------|
| AC-002-01 | `GET /auth/google` redirects to Google's OAuth consent screen. |
| AC-002-02 | `GET /auth/google/callback` processes the callback and authenticates the user. |
| AC-002-03 | New users created via Google have `isEmailVerified` set to `true`. |
| AC-002-04 | A UserProfiles record is created for new Google OAuth users. |
| AC-002-05 | A valid JWT access token is returned after successful Google authentication. |
| AC-002-06 | Existing users with matching email are linked to Google identity. |

### 5.2 LinkedIn OAuth

| ID | Criterion |
|----|-----------|
| AC-002-07 | `GET /auth/linkedin` redirects to LinkedIn's OAuth consent screen. |
| AC-002-08 | `GET /auth/linkedin/callback` processes the callback and authenticates the user. |
| AC-002-09 | New users created via LinkedIn have `isEmailVerified` set to `true`. |
| AC-002-10 | A UserProfiles record is created for new LinkedIn OAuth users. |
| AC-002-11 | A valid JWT access token is returned after successful LinkedIn authentication. |
| AC-002-12 | Existing users with matching email are linked to LinkedIn identity. |

### 5.3 OAuth Identity Storage

| ID | Criterion |
|----|-----------|
| AC-002-13 | Access tokens are encrypted before being stored in `accessTokenRef`. |
| AC-002-14 | Refresh tokens are encrypted before being stored in `refreshTokenRef`. |
| AC-002-15 | The `(provider, providerUserId)` combination is unique. |
| AC-002-16 | `linkedAt` is set correctly for new OAuth identities. |

### 5.4 Error Handling

| ID | Criterion |
|----|-----------|
| AC-002-17 | Invalid OAuth callback returns an appropriate error response. |
| AC-002-18 | Missing email from OAuth provider returns a clear error message. |
| AC-002-19 | Database errors during OAuth flow are logged and handled gracefully. |

---

## 6. Dependencies

### 6.1 External Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| @nestjs/passport | ^10.0.0 | Passport integration for NestJS |
| passport-google-oauth20 | ^2.0.0 | Google OAuth 2.0 strategy |
| passport-linkedin-oauth2 | ^2.0.0 | LinkedIn OAuth 2.0 strategy |
| @types/passport-google-oauth20 | ^2.0.0 | Type definitions |
| @types/passport-linkedin-oauth2 | ^2.0.0 | Type definitions |

### 6.2 Internal Dependencies

| Dependency | Description |
|------------|-------------|
| Feature 001 | JWT authentication system |
| Users module | User and profile management |
| Database schema | OauthIdentities table |

---

## 7. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| OAuth provider service disruption | High | Implement timeout and retry; show user-friendly error messages |
| Invalid/expired OAuth tokens | Medium | Handle token errors gracefully; prompt user to re-authenticate |
| Email mismatch (OAuth email different from existing account) | Medium | Implement account linking flow; allow users to connect identities |
| OAuth provider API changes | Medium | Use well-maintained libraries; monitor provider documentation |
| Security of stored OAuth tokens | High | Encrypt tokens at rest; use secure key management |

---

## 8. Technical Notes

### 8.1 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth 2.0 client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth 2.0 client secret |
| `GOOGLE_CALLBACK_URL` | Yes | Google OAuth callback URL |
| `LINKEDIN_CLIENT_ID` | Yes | LinkedIn OAuth 2.0 client ID |
| `LINKEDIN_CLIENT_SECRET` | Yes | LinkedIn OAuth 2.0 client secret |
| `LINKEDIN_CALLBACK_URL` | Yes | LinkedIn OAuth callback URL |

### 8.2 OAuth Provider Configuration

**Google OAuth Scopes:**
- `profile` - User's profile information
- `email` - User's email address

**LinkedIn OAuth Scopes:**
- `profile` - User's profile information
- `email` - User's email address

### 8.3 OAuth Identity Model

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

### 8.4 OAuth Flow Response

After successful OAuth authentication, the system should redirect to the frontend with JWT tokens (via query parameters) or return them in a standardized response format, depending on the implementation approach (server-side vs. SPA).

### 8.5 Reference Documents

- Levora Database Design v1.2 (OauthIdentities table)
- System Architecture Design v2.0
- AGENTS.md (Project rules and guidelines)
- SRS v1.0 (Section 3.1: Authentication & Account Management)
```

---

