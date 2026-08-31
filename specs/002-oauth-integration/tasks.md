````markdown
# Tasks: OAuth Integration (Google + LinkedIn)

**Feature ID:** 002
**Feature Name:** OAuth Integration (Google + LinkedIn)
**Sprint:** 1
**Status:** Draft
**Created:** 2026-08-19
**Updated:** 2026-08-20

---

## 1. Task Summary

| Phase                                          | Tasks        | Estimated Time |
| ---------------------------------------------- | ------------ | -------------- |
| Phase 1: Setup & Configuration                 | 5 tasks      | 1.5 hours      |
| Phase 2: Core Services (Encryption & Identity) | 3 tasks      | 1.5 hours      |
| Phase 3: OAuth Processor Logic                 | 4 tasks      | 2 hours        |
| Phase 4: Integration & Customization           | 4 tasks      | 1.5 hours      |
| Phase 5: Testing                               | 5 tasks      | 2.5 hours      |
| **Total**                                      | **21 tasks** | **9 hours**    |

---

## 2. Phase 1: Setup & Configuration

### Task 1.1: Verify Existing Social Auth Setup

**ID:** TASK-002-01
**Priority:** High
**Dependencies:** Feature 001 complete
**Estimate:** 15 minutes

**Description:** Confirm that `@nestjs/social-auth` is installed and configured with the basic routes.

**Steps:**

1. Check `package.json` for `@nestjs/social-auth` and related passport libraries.
2. Verify that `AuthModule` imports the social auth module.
3. Verify that `/auth/google` and `/auth/linkedin` routes are accessible.

**Acceptance Criteria:**

- Social auth module is present.
- Routes are defined (even if just placeholders).

---

### Task 1.2: Install Nock for E2E Testing

**ID:** TASK-002-02
**Priority:** High
**Dependencies:** None
**Estimate:** 5 minutes

**Description:** Install `nock` as a dev dependency to mock external HTTP calls in E2E tests.

**Steps:**

```bash
pnpm add -D nock @types/nock
```
````

**Acceptance Criteria:**

- `nock` is added to `package.json` devDependencies.

---

### Task 1.3: Update Environment Configuration

**ID:** TASK-002-03
**Priority:** High
**Dependencies:** None
**Estimate:** 15 minutes

**Description:** Add OAuth configuration to the config module.

**Steps:**

1. Update `config/configuration.ts` with `google` and `linkedin` objects.
2. Add validation for `OAUTH_ENCRYPTION_KEY` (length check).
3. Update `config/validation.ts` if exists.

**Acceptance Criteria:**

- OAuth environment variables are loaded and validated.
- Invalid key fails fast during startup.

---

### Task 1.4: Update .env.example

**ID:** TASK-002-04
**Priority:** High
**Dependencies:** TASK-002-03
**Estimate:** 10 minutes

**Description:** Update `.env.example` with all OAuth environment variables.

**Steps:**

1. Add Google and LinkedIn variables.
2. Add `OAUTH_ENCRYPTION_KEY` with a placeholder and comments.
3. Add command to generate key.

**Acceptance Criteria:**

- `.env.example` is complete and documented.

---

### Task 1.5: Seed Default Role `user`

**ID:** TASK-002-05
**Priority:** High
**Dependencies:** Feature 001 (roles table exists)
**Estimate:** 20 minutes

**Description:** Ensure the `user` role exists in the database. Create a seed script if missing.

**Steps:**

1. Check if `prisma/seed.ts` exists.
2. Add an upsert for the `roles` table:
   ```typescript
   await prisma.roles.upsert({
     where: { name: 'user' },
     update: {},
     create: { name: 'user', description: 'Default user role' },
   });
   ```
3. Add similar logic for `content_admin` and `system_admin` if not present.
4. Run `pnpm prisma db seed` to verify.

**Acceptance Criteria:**

- Role `user` exists in the database.
- Seed script is idempotent.

---

## 3. Phase 2: Core Services (Encryption & Identity)

### Task 2.1: Implement Encryption Service

**ID:** TASK-002-06
**Priority:** High
**Dependencies:** TASK-002-03
**Estimate:** 30 minutes

**Description:** Create `EncryptionService` for AES-256-CBC token encryption.

**Steps:**

1. Create `src/modules/auth/services/encryption.service.ts`.
2. Implement `encrypt(text: string): string`.
3. Implement `decrypt(encryptedText: string): string`.
4. Use `crypto` with `aes-256-cbc`.
5. Validate key at construction.

**Acceptance Criteria:**

- Encryption/decryption is reversible.
- Throws error for invalid key format.
- Unit tests pass (Task 5.1).

---

### Task 2.2: Implement OAuth Identity Service

**ID:** TASK-002-07
**Priority:** High
**Dependencies:** TASK-002-06
**Estimate:** 30 minutes

**Description:** Create service for CRUD operations on `OauthIdentities`.

**Steps:**

1. Create `src/modules/auth/services/oauth-identity.service.ts`.
2. Implement `findByProvider(provider, providerUserId)`.
3. Implement `create(data)`.
4. Implement `update(id, data)`.
5. Implement `findByUser(userId)`.

**Acceptance Criteria:**

- All methods interact correctly with Prisma.
- Tokens are encrypted before storage (done by the caller, but ensure type safety).

---

### Task 2.3: Define OAuth Interfaces

**ID:** TASK-002-08
**Priority:** High
**Dependencies:** None
**Estimate:** 15 minutes

**Description:** Create interfaces for standardized OAuth data.

**Steps:**

1. Create `src/modules/auth/interfaces/oauth-profile.interface.ts`.
2. Define `OAuthLoginData` interface.
3. Define `OAuthProfile` interface.

**Acceptance Criteria:**

- Interfaces are typed and reusable.

---

## 4. Phase 3: OAuth Processor Logic

### Task 3.1: Implement OAuth Processor Service

**ID:** TASK-002-09
**Priority:** High
**Dependencies:** TASK-002-07, TASK-002-06
**Estimate:** 45 minutes

**Description:** Create the core business logic service `OAuthProcessorService`.

**Steps:**

1. Create `src/modules/auth/services/oauth-processor.service.ts`.
2. Implement `processOAuthLogin(data: OAuthLoginData)`.
3. Include logic for:
   - Missing email -> throw `BadRequestException`.
   - Existing identity -> update tokens.
   - Existing user by email -> link identity.
   - New user -> create with `isDraft: true`, assign `user` role.

**Acceptance Criteria:**

- Logic matches the plan.
- Handles all edge cases gracefully.

---

### Task 3.2: Handle Missing Email Logic

**ID:** TASK-002-10
**Priority:** High
**Dependencies:** TASK-002-09
**Estimate:** 15 minutes

**Description:** Ensure the processor explicitly rejects attempts without an email.

**Steps:**

1. Add validation in `processOAuthLogin`.
2. Throw a specific exception with the error message: "Unable to retrieve email from the provider..."
3. Ensure the exception is logged.

**Acceptance Criteria:**

- Authentication fails with a clear message if email is missing.

---

### Task 3.3: Implement User Linking Logic

**ID:** TASK-002-11
**Priority:** High
**Dependencies:** TASK-002-09
**Estimate:** 15 minutes

**Description:** Ensure that when an email matches an existing user, the OAuth identity is linked.

**Steps:**

1. In `processOAuthLogin`, check for existing user by email.
2. If found, create the OAuth identity linked to this user.
3. Do not create a new user.

**Acceptance Criteria:**

- Existing users are linked, not duplicated.

---

### Task 3.4: Implement User Creation with isDraft

**ID:** TASK-002-12
**Priority:** High
**Dependencies:** TASK-002-09
**Estimate:** 15 minutes

**Description:** Ensure new users are created with `isDraft: true`.

**Steps:**

1. In the user creation logic, set `userProfile.create.isDraft = true`.
2. Ensure the profile is created automatically via Prisma's nested create.

**Acceptance Criteria:**

- New OAuth users have `isDraft: true` in `user_profiles`.

---

## 5. Phase 4: Integration & Customization

### Task 4.1: Customize Google Strategy

**ID:** TASK-002-13
**Priority:** High
**Dependencies:** TASK-002-09
**Estimate:** 30 minutes

**Description:** Extend or modify the Google strategy to use `OAuthProcessorService`.

**Steps:**

1. Locate the Google strategy class (provided by `@nestjs/social-auth` or custom).
2. Override the `validate` method.
3. Extract profile data and call `processOAuthLogin`.
4. Catch exceptions and pass them to the `done` callback.

**Acceptance Criteria:**

- Google strategy uses the new processor.

---

### Task 4.2: Customize LinkedIn Strategy

**ID:** TASK-002-14
**Priority:** High
**Dependencies:** TASK-002-09
**Estimate:** 30 minutes

**Description:** Extend or modify the LinkedIn strategy to use `OAuthProcessorService`.

**Steps:**

1. Similar to Task 4.1, but for the LinkedIn strategy.
2. Call `processOAuthLogin`.

**Acceptance Criteria:**

- LinkedIn strategy uses the new processor.

---

### Task 4.3: Register Services in Auth Module

**ID:** TASK-002-15
**Priority:** High
**Dependencies:** TASK-002-09, TASK-002-06, TASK-002-07
**Estimate:** 10 minutes

**Description:** Register the new services in the Auth module's providers.

**Steps:**

1. Add `EncryptionService`, `OauthIdentityService`, `OAuthProcessorService` to the providers array in `AuthModule`.
2. Export them if needed by other modules.

**Acceptance Criteria:**

- Services are available for dependency injection.

---

### Task 4.4: Update Auth Controller Error Responses

**ID:** TASK-002-16
**Priority:** Medium
**Dependencies:** TASK-002-13, TASK-002-14
**Estimate:** 15 minutes

**Description:** Ensure that errors thrown by the processor are correctly mapped to HTTP responses.

**Steps:**

1. Add a global exception filter for `BadRequestException` if not present.
2. Ensure the missing email error returns a 400 status.
3. Ensure other errors return 500 and are logged.

**Acceptance Criteria:**

- HTTP status codes and messages are correct.

---

## 6. Phase 5: Testing

### Task 5.1: Unit Tests for Encryption Service

**ID:** TASK-002-17
**Priority:** High
**Dependencies:** TASK-002-06
**Estimate:** 20 minutes

**Description:** Write unit tests for `EncryptionService`.

**Steps:**

1. Create `encryption.service.spec.ts`.
2. Test `encrypt` and `decrypt` with valid data.
3. Test decryption with invalid data (should throw).
4. Test key validation.

**Acceptance Criteria:**

- 100% coverage for EncryptionService.

---

### Task 5.2: Unit Tests for OAuth Processor Service

**ID:** TASK-002-18
**Priority:** High
**Dependencies:** TASK-002-09
**Estimate:** 45 minutes

**Description:** Write unit tests for `OAuthProcessorService` mocking Prisma and encryption.

**Steps:**

1. Create `oauth-processor.service.spec.ts`.
2. Mock `PrismaService` and `EncryptionService`.
3. Test all branches:
   - New user creation (with `isDraft: true`).
   - Existing user linking.
   - Existing identity update.
   - Missing email exception.
   - Missing role exception.

**Acceptance Criteria:**

- ≥ 90% coverage.

---

### Task 5.3: Unit Tests for OAuthIdentity Service

**ID:** TASK-002-19
**Priority:** High
**Dependencies:** TASK-002-07
**Estimate:** 20 minutes

**Description:** Write unit tests for `OauthIdentityService`.

**Steps:**

1. Create `oauth-identity.service.spec.ts`.
2. Test all CRUD methods.

**Acceptance Criteria:**

- ≥ 80% coverage.

---

### Task 5.4: E2E Tests with Nock

**ID:** TASK-002-20
**Priority:** High
**Dependencies:** TASK-002-02, TASK-002-16
**Estimate:** 45 minutes

**Description:** Write E2E tests using `supertest` and `nock`.

**Steps:**

1. Create `test/oauth.e2e-spec.ts`.
2. Use `nock` to mock Google's token and profile endpoints.
3. Test scenarios:
   - New user signup (Google).
   - Existing user login (LinkedIn).
   - Missing email (Google) -> 400 error.
   - Invalid code -> 400/500 error.
4. Assert database state after each test.

**Acceptance Criteria:**

- All E2E tests pass.
- External calls are mocked, no real network calls.

---

### Task 5.5: Manual QA Checklist

**ID:** TASK-002-21
**Priority:** High
**Dependencies:** TASK-002-20
**Estimate:** 20 minutes

**Description:** Perform manual testing in a staging environment.

**Steps:**

1. Configure real OAuth credentials in staging.
2. Test Google login/register.
3. Test LinkedIn login/register.
4. Test account linking (register via Google, then login via LinkedIn with same email).
5. Verify database state (`isDraft`, identities, roles).

**Acceptance Criteria:**

- All manual flows work as expected.

---

## 7. Task Dependencies Graph

```
TASK-002-01 (Verify Social Auth)
    │
    ├─ TASK-002-02 (Install Nock) ──────────────────────┐
    │                                                    │
TASK-002-03 (Config)                                     │
    ├─ TASK-002-04 (.env)                                │
    └─ TASK-002-05 (Seed Role)                           │
                                                         │
TASK-002-06 (Encryption) ─ TASK-002-07 (Identity CRUD)   │
    │                           │                         │
    └─────── TASK-002-08 (Interfaces)                    │
                │                                         │
                ├─ TASK-002-09 (OAuth Processor)          │
                │       ├─ TASK-002-10 (Missing Email)    │
                │       ├─ TASK-002-11 (Linking)          │
                │       └─ TASK-002-12 (isDraft)          │
                │                                         │
                ├─ TASK-002-13 (Custom Google)            │
                ├─ TASK-002-14 (Custom LinkedIn)          │
                ├─ TASK-002-15 (Register Services)        │
                └─ TASK-002-16 (Error Handling)           │
                                                         │
                ├─ TASK-002-17 (Encryption Tests)         │
                ├─ TASK-002-18 (Processor Tests)          │
                ├─ TASK-002-19 (Identity Tests)           │
                └─ TASK-002-20 (E2E Tests) ───────────────┘
                    │
                    └─ TASK-002-21 (Manual QA)
```

---

## 8. Validation Checklist

After completing all tasks, verify:

- [ ] `pnpm lint` passes with no errors.
- [ ] `pnpm test` passes with ≥80% coverage.
- [ ] `pnpm build` completes successfully.
- [ ] Google OAuth flow works end-to-end (real credentials).
- [ ] LinkedIn OAuth flow works end-to-end (real credentials).
- [ ] OAuth identities stored correctly in database.
- [ ] Tokens are encrypted before storage.
- [ ] New users have `isDraft: true` in `user_profiles`.
- [ ] Existing users are linked correctly.
- [ ] Missing email returns a clear error message (400).
- [ ] Default role `user` exists and is assigned.

---

## 9. Notes

- All commands assume `pnpm` as the package manager.
- OAuth provider credentials must be obtained from Google and LinkedIn developer consoles.
- Encryption key must be 64 characters (256 bits) in hex format.
- All code must follow AGENTS.md guidelines.
- We are leveraging the existing `@nestjs/social-auth` package; we are not replacing it.

```

```
