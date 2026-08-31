```markdown
# Implementation Plan: OAuth Integration (Google + LinkedIn)

**Feature ID:** 002
**Feature Name:** OAuth Integration (Google + LinkedIn)
**Sprint:** 1
**Status:** Draft
**Created:** 2026-08-19
**Updated:** 2026-08-20

---

## 1. Technical Context

### 1.1 Technology Stack

| Layer             | Technology                                        | Version |
| ----------------- | ------------------------------------------------- | ------- |
| Backend Framework | NestJS                                            | ^10.0.0 |
| Authentication    | @nestjs/social-auth (existing), Passport.js       | ^0.6.0  |
| OAuth Strategies  | passport-google-oauth20, passport-linkedin-oauth2 | ^2.0.0  |
| Database ORM      | Prisma                                            | ^5.0.0  |
| Database          | PostgreSQL                                        | 15+     |
| Encryption        | Crypto (Node.js built-in)                         | -       |
| Testing (E2E)     | nock                                              | ^13.0.0 |

### 1.2 Architecture Patterns

| Pattern              | Description                                                        |
| -------------------- | ------------------------------------------------------------------ |
| Adapter Pattern      | Wrap `@nestjs/social-auth` strategies with custom business logic.  |
| Strategy Pattern     | OAuth strategies for different providers.                          |
| Dependency Injection | NestJS DI for service composition.                                 |
| Repository Pattern   | Prisma for data access.                                            |
| Factory Pattern      | User creation from OAuth profile data via `OAuthProcessorService`. |

---

## 2. Architecture Overview

### 2.1 Module Structure (Additions to Auth Module)

We will leverage the existing `@nestjs/social-auth` module configuration. Our custom logic will reside in new services.
```

src/modules/auth/
├── strategies/ # (Existing, from social-auth)
│ ├── google.strategy.ts # Already configured by social-auth
│ └── linkedin.strategy.ts # Already configured by social-auth
├── services/
│ ├── auth.service.ts # Extended with OAuth methods
│ ├── oauth-processor.service.ts # NEW: Core OAuth business logic (creation, linking, encryption)
│ ├── encryption.service.ts # NEW: Token encryption/decryption
│ └── oauth-identity.service.ts # NEW: CRUD for OauthIdentities
├── controllers/
│ └── auth.controller.ts # Extended with OAuth endpoints (already present from social-auth)
├── guards/
│ └── oauth.guard.ts # Optional custom guard if needed
└── interfaces/
└── oauth-profile.interface.ts # NEW: Standardized OAuth profile interface

```

### 2.2 OAuth Flow Diagram (Customized)

```

┌─────────┐ ┌──────────────────────┐ ┌─────────────┐
│ Client │ │ NestJS Auth │ │ OAuth │
│ │ │ Module │ │ Provider │
└────┬────┘ └──────────┬───────────┘ └──────┬──────┘
│ │ │
│ GET /auth/google │ │
├────────────────────────>│ │
│ │ │
│ │ Redirect to Provider │
│ ├───────────────────────────>│
│ │ │
│ │ Provider redirects to │
│ │ callback URL │
│ │<───────────────────────────┤
│ │ │
│ │ social-auth validates code │
│ │ and fetches profile │
│ ├───────────────────────────>│
│ │ │
│ │ Profile + Tokens │
│ │<───────────────────────────┤
│ │ │
│ │ --- OAuthProcessorService --- │
│ │ 1. Check email present │
│ │ 2. Encrypt tokens │
│ │ 3. Find/Create User │
│ │ 4. Link/Link OAuth Identity│
│ │ 5. Generate JWT │
│ │ │
│ Redirect with JWT │ │
│<────────────────────────┤ │
│ │ │

````

---

## 3. Implementation Strategy

### 3.1 Phase 1: Setup & Configuration

**Goal:** Prepare the environment and ensure dependencies are aligned.

**Tasks:**
1. Verify `@nestjs/social-auth` installation and configuration.
2. Install `nock` for E2E testing (`pnpm add -D nock`).
3. Update environment configuration with Google and LinkedIn settings.
4. Create `.env.example` entries for all OAuth variables.
5. Ensure `OAUTH_ENCRYPTION_KEY` is generated (64 hex chars) and documented.
6. **Crucial:** Verify or create a database seed for the default role `user`.

### 3.2 Phase 2: Core Services (Encryption & Identity)

**Goal:** Build the foundational services independent of the provider.

**Tasks:**
1. Implement `EncryptionService` (AES-256-CBC).
2. Implement `OauthIdentityService` (CRUD operations on `OauthIdentities`).
3. Write unit tests for both services.

### 3.3 Phase 3: OAuth Processor Service

**Goal:** Implement the central business logic for handling OAuth callbacks.

**Tasks:**
1. Create `OAuthProcessorService`.
2. Implement `handleOAuthLogin(provider, providerUserId, email, firstName, lastName, accessToken, refreshToken)`.
   - Check for missing email -> throw `BadRequestException` with specific message.
   - Check for existing identity -> update tokens, return user.
   - Check for existing user by email -> link identity, return user.
   - Create new user -> set `isDraft: true`, create profile, assign role `user`.
3. Integrate `EncryptionService` and `OauthIdentityService`.

### 3.4 Phase 4: Customize Social Auth Integration

**Goal:** Plug the `OAuthProcessorService` into the existing `@nestjs/social-auth` strategies.

**Tasks:**
1. Extend or customize the existing Google and LinkedIn strategy classes (or their parent).
2. Override/modify the `validate` method to call `OAuthProcessorService.handleOAuthLogin`.
3. Handle exceptions from the processor (e.g., missing email) and convert them to appropriate HTTP responses.
4. Ensure the existing public endpoints (`/auth/google`, `/auth/google/callback`, etc.) use these customized strategies.

### 3.5 Phase 5: Testing

**Goal:** Ensure full coverage and end-to-end flow correctness.

**Tasks:**
1. Unit tests for `OAuthProcessorService` (mocking database, encryption).
2. Unit tests for strategies (mocking `OAuthProcessorService`).
3. E2E tests using `supertest` and `nock` to mock external provider responses (Google/LinkedIn).
   - Test successful new user creation.
   - Test successful existing user login.
   - Test missing email error.
   - Test invalid token error.

---

## 4. API Design

*No changes to the public API endpoints; they remain as provided by `@nestjs/social-auth`.*

| Endpoint | Method | Description | Public |
|----------|--------|-------------|--------|
| `/auth/google` | GET | Initiates Google OAuth flow | Yes |
| `/auth/google/callback` | GET | Handles Google OAuth callback | Yes |
| `/auth/linkedin` | GET | Initiates LinkedIn OAuth flow | Yes |
| `/auth/linkedin/callback` | GET | Handles LinkedIn OAuth callback | Yes |

---

## 5. Core Service Implementation Details

### 5.1 OAuthProcessorService (Pseudo-code)

```typescript
@Injectable()
export class OAuthProcessorService {
  constructor(
    private prisma: PrismaService,
    private encryptionService: EncryptionService,
    private jwtService: JwtService,
  ) {}

  async processOAuthLogin(data: OAuthLoginData) {
    const { provider, providerUserId, email, firstName, lastName, accessToken, refreshToken } = data;

    // 1. Validate Email
    if (!email) {
      throw new BadRequestException(
        'Unable to retrieve email from the provider. Please ensure your email is public or use another login method.'
      );
    }

    // 2. Encrypt Tokens
    const encryptedAccess = this.encryptionService.encrypt(accessToken);
    const encryptedRefresh = refreshToken ? this.encryptionService.encrypt(refreshToken) : null;

    // 3. Check Existing Identity
    let identity = await this.prisma.oauthIdentities.findUnique({
      where: { provider_providerUserId: { provider, providerUserId } },
      include: { user: true },
    });

    if (identity) {
      // Update tokens and return user
      await this.prisma.oauthIdentities.update({
        where: { id: identity.id },
        data: { accessTokenRef: encryptedAccess, refreshTokenRef: encryptedRefresh },
      });
      return identity.user;
    }

    // 4. Check Existing User by Email
    let user = await this.prisma.users.findUnique({ where: { email } });

    if (user) {
      // Link identity
      await this.prisma.oauthIdentities.create({
        data: { userId: user.id, provider, providerUserId, accessTokenRef: encryptedAccess, refreshTokenRef: encryptedRefresh },
      });
      return user;
    }

    // 5. Create New User
    user = await this.prisma.users.create({
      data: {
        email,
        firstName,
        lastName,
        isEmailVerified: true,
        isActive: true,
        userProfile: {
          create: {
            fullName: `${firstName || ''} ${lastName || ''}`.trim(),
            isDraft: true, // KEY: User must complete onboarding
          },
        },
        oauthIdentities: {
          create: { provider, providerUserId, accessTokenRef: encryptedAccess, refreshTokenRef: encryptedRefresh },
        },
      },
    });

    // 6. Assign Default Role
    const userRole = await this.prisma.roles.findUnique({ where: { name: 'user' } });
    if (userRole) {
      await this.prisma.userRoles.create({ data: { userId: user.id, roleId: userRole.id } });
    } else {
      // Fail-safe: Log critical error (should be seeded)
      console.error('CRITICAL: Default role "user" not found.');
      // Optionally create it on the fly, but seeding is preferred.
    }

    return user;
  }
}
````

---

## 6. Database Schema Updates

**No changes are required** to the database schema. The `OauthIdentities` table and its fields (`accessTokenRef`, `refreshTokenRef`) already exist as per `Levora_Database_Design_v1.2_MVP.md`.

**Required Seed Data:**

- Ensure the `roles` table contains at least the `user` role. If not, add a seed script (`prisma/seed.ts`).

---

## 7. Testing Plan

### 7.1 Unit Tests

| Test Suite            | Target                      | Coverage Goal |
| --------------------- | --------------------------- | ------------- |
| EncryptionService     | encrypt/decrypt methods     | 100%          |
| OauthIdentityService  | CRUD operations             | ≥ 80%         |
| OAuthProcessorService | All business logic branches | ≥ 90%         |

### 7.2 E2E Tests (Using `nock`)

Mock external API calls to Google and LinkedIn. This isolates our logic from external network flakiness.

| Test Case           | Provider | Steps                                            | Expected Result                              |
| ------------------- | -------- | ------------------------------------------------ | -------------------------------------------- |
| New User Signup     | Google   | Mock provider returns valid profile with email.  | User created, JWT returned, `isDraft: true`. |
| Existing User Login | LinkedIn | Mock provider returns email of an existing user. | User linked, JWT returned.                   |
| Missing Email       | Google   | Mock provider returns profile without email.     | 400 Bad Request with error message.          |
| Invalid Code        | LinkedIn | Mock provider returns error.                     | 400/500 error, logged.                       |

---

## 8. Configuration

### 8.1 Environment Variables (.env.example additions)

```env
# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3000/api/auth/google/callback"

# LinkedIn OAuth
LINKEDIN_CLIENT_ID="your-linkedin-client-id"
LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"
LINKEDIN_CALLBACK_URL="http://localhost:3000/api/auth/linkedin/callback"

# OAuth Token Encryption (Generate with: node -e "console.log(crypto.randomBytes(32).toString('hex'))")
OAUTH_ENCRYPTION_KEY="a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890"
```

### 8.2 Configuration Module Updates

```typescript
// config/configuration.ts
export default () => ({
  // ... existing config
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
  },
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackUrl: process.env.LINKEDIN_CALLBACK_URL,
  },
});
```

---

## 9. Quality Gates

| Gate    | Check                                                     | Pass/Fail |
| ------- | --------------------------------------------------------- | --------- |
| Gate 1  | `pnpm lint` passes with no errors                         | [ ]       |
| Gate 2  | `pnpm test` passes with ≥80% coverage                     | [ ]       |
| Gate 3  | `pnpm build` completes successfully                       | [ ]       |
| Gate 4  | Default role `user` exists in database (checked via seed) | [ ]       |
| Gate 5  | Google OAuth flow works end-to-end (manual + E2E)         | [ ]       |
| Gate 6  | LinkedIn OAuth flow works end-to-end (manual + E2E)       | [ ]       |
| Gate 7  | OAuth identities stored correctly with encrypted tokens   | [ ]       |
| Gate 8  | New users created with `isDraft: true` profile            | [ ]       |
| Gate 9  | Existing users linked correctly                           | [ ]       |
| Gate 10 | Missing email returns a clear error message               | [ ]       |

---

## 10. References

- [Levora Database Design v1.2](../database/Levora_Database_Design_v1.2_MVP.md)
- [System Architecture Design v2.0](../architecture/System_Architecture_Design.md)
- [AGENTS.md](../AGENTS.md)
- [SRS v1.0 Section 3.1](../requirements/Levora_SRS.md#31-authentication-account-management)
- Feature 001: Project Setup & JWT Auth

```

```
