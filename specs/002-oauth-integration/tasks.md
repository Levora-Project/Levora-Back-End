
```markdown
# Tasks: OAuth Integration (Google + LinkedIn)

**Feature ID:** 002
**Feature Name:** OAuth Integration (Google + LinkedIn)
**Sprint:** 1
**Status:** Draft
**Created:** 2026-08-19
**Updated:** 2026-08-19

---

## 1. Task Summary

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1: Setup & Configuration | 4 tasks | 1 hour |
| Phase 2: Google OAuth | 6 tasks | 2 hours |
| Phase 3: LinkedIn OAuth | 6 tasks | 2 hours |
| Phase 4: User Management | 5 tasks | 1.5 hours |
| Phase 5: Testing | 4 tasks | 1.5 hours |
| **Total** | **25 tasks** | **8 hours** |

---

## 2. Phase 1: Setup & Configuration

### Task 1.1: Install OAuth Dependencies
**ID:** TASK-002-01
**Priority:** High
**Dependencies:** Feature 001 complete
**Estimate:** 5 minutes

**Description:** Install required OAuth packages.

**Steps:**
```bash
pnpm add passport-google-oauth20 passport-linkedin-oauth2
pnpm add -D @types/passport-google-oauth20 @types/passport-linkedin-oauth2
```

**Acceptance Criteria:**
- All packages installed
- Type definitions available

---

### Task 1.2: Update Environment Configuration
**ID:** TASK-002-02
**Priority:** High
**Dependencies:** TASK-002-01
**Estimate:** 15 minutes

**Description:** Add OAuth configuration to config module.

**Steps:**
1. Update `config/configuration.ts` with Google and LinkedIn config
2. Add `OAUTH_ENCRYPTION_KEY` to config
3. Update `config/validation.ts` if exists

**Acceptance Criteria:**
- All OAuth environment variables defined
- Configuration loads correctly

---

### Task 1.3: Update .env.example
**ID:** TASK-002-03
**Priority:** High
**Dependencies:** TASK-002-02
**Estimate:** 10 minutes

**Description:** Update `.env.example` with all OAuth environment variables.

**Steps:**
1. Add Google OAuth variables
2. Add LinkedIn OAuth variables
3. Add OAuth encryption key variable
4. Add comments for each variable

**Acceptance Criteria:**
- `.env.example` includes all OAuth variables
- Variables are clearly documented

---

### Task 1.4: Create OAuth Interfaces and DTOs
**ID:** TASK-002-04
**Priority:** High
**Dependencies:** None
**Estimate:** 30 minutes

**Description:** Create interfaces and DTOs for OAuth handling.

**Steps:**
1. Create `src/modules/auth/interfaces/oauth-profile.interface.ts`
2. Create `src/modules/auth/dto/oauth-callback.dto.ts`
3. Create `src/modules/auth/interfaces/oauth-login-data.interface.ts`

**Acceptance Criteria:**
- All interfaces defined with proper types
- DTOs have validation where needed

---

## 3. Phase 2: Google OAuth Integration

### Task 2.1: Create Google Strategy
**ID:** TASK-002-05
**Priority:** High
**Dependencies:** TASK-002-02
**Estimate:** 30 minutes

**Description:** Implement the Google OAuth strategy.

**Steps:**
1. Create `src/modules/auth/strategies/google.strategy.ts`
2. Extend `PassportStrategy(Strategy, 'google')`
3. Implement constructor with config
4. Implement `validate` method
5. Handle Google profile data

**Acceptance Criteria:**
- Google strategy defined
- Validates correctly
- Handles profile data

---

### Task 2.2: Register Google Strategy in Auth Module
**ID:** TASK-002-06
**Priority:** High
**Dependencies:** TASK-002-05
**Estimate:** 5 minutes

**Description:** Register the Google strategy in the Auth module.

**Steps:**
1. Import GoogleStrategy in AuthModule
2. Add to providers array
3. Export if needed

**Acceptance Criteria:**
- Strategy registered in module
- Available for dependency injection

---

### Task 2.3: Implement Google OAuth Controller Endpoints
**ID:** TASK-002-07
**Priority:** High
**Dependencies:** TASK-002-06
**Estimate:** 15 minutes

**Description:** Add Google OAuth endpoints to AuthController.

**Steps:**
1. Add `GET /auth/google` endpoint using `@UseGuards(AuthGuard('google'))`
2. Add `GET /auth/google/callback` endpoint
3. Use `@Public()` for both endpoints
4. Handle redirect after authentication

**Acceptance Criteria:**
- Both endpoints accessible
- Proper guards applied
- Public endpoints bypass JWT check

---

### Task 2.4: Implement OAuth Service Method for Google
**ID:** TASK-002-08
**Priority:** High
**Dependencies:** TASK-002-07
**Estimate:** 30 minutes

**Description:** Implement OAuth service method for handling Google authentication.

**Steps:**
1. Create `OAuthService.handleGoogleLogin` method
2. Process Google profile data
3. Encrypt tokens
4. Store OAuth identity

**Acceptance Criteria:**
- Service method handles Google login
- Tokens encrypted
- Identity stored correctly

---

### Task 2.5: Implement User Creation for Google
**ID:** TASK-002-09
**Priority:** High
**Dependencies:** TASK-002-08
**Estimate:** 15 minutes

**Description:** Create or find user from Google OAuth data.

**Steps:**
1. Check if OAuth identity exists
2. If exists, update tokens and return user
3. If email exists, link identity to existing user
4. If new, create user with profile and role

**Acceptance Criteria:**
- Users created correctly from Google data
- Existing users linked
- Profile and role assigned

---

### Task 2.6: Add Error Handling for Google OAuth
**ID:** TASK-002-10
**Priority:** Medium
**Dependencies:** TASK-002-09
**Estimate:** 15 minutes

**Description:** Implement comprehensive error handling for Google OAuth.

**Steps:**
1. Handle missing email from Google
2. Handle database errors
3. Handle token encryption errors
4. Log errors with context

**Acceptance Criteria:**
- All errors handled gracefully
- User-friendly messages displayed
- Errors logged for monitoring

---

## 4. Phase 3: LinkedIn OAuth Integration

### Task 3.1: Create LinkedIn Strategy
**ID:** TASK-002-11
**Priority:** High
**Dependencies:** TASK-002-02
**Estimate:** 30 minutes

**Description:** Implement the LinkedIn OAuth strategy.

**Steps:**
1. Create `src/modules/auth/strategies/linkedin.strategy.ts`
2. Extend `PassportStrategy(Strategy, 'linkedin')`
3. Implement constructor with config
4. Implement `validate` method
5. Handle LinkedIn profile data

**Acceptance Criteria:**
- LinkedIn strategy defined
- Validates correctly
- Handles profile data

---

### Task 3.2: Register LinkedIn Strategy in Auth Module
**ID:** TASK-002-12
**Priority:** High
**Dependencies:** TASK-002-11
**Estimate:** 5 minutes

**Description:** Register the LinkedIn strategy in the Auth module.

**Steps:**
1. Import LinkedInStrategy in AuthModule
2. Add to providers array
3. Export if needed

**Acceptance Criteria:**
- Strategy registered in module
- Available for dependency injection

---

### Task 3.3: Implement LinkedIn OAuth Controller Endpoints
**ID:** TASK-002-13
**Priority:** High
**Dependencies:** TASK-002-12
**Estimate:** 15 minutes

**Description:** Add LinkedIn OAuth endpoints to AuthController.

**Steps:**
1. Add `GET /auth/linkedin` endpoint using `@UseGuards(AuthGuard('linkedin'))`
2. Add `GET /auth/linkedin/callback` endpoint
3. Use `@Public()` for both endpoints
4. Handle redirect after authentication

**Acceptance Criteria:**
- Both endpoints accessible
- Proper guards applied
- Public endpoints bypass JWT check

---

### Task 3.4: Implement OAuth Service Method for LinkedIn
**ID:** TASK-002-14
**Priority:** High
**Dependencies:** TASK-002-13
**Estimate:** 30 minutes

**Description:** Implement OAuth service method for handling LinkedIn authentication.

**Steps:**
1. Create `OAuthService.handleLinkedInLogin` method
2. Process LinkedIn profile data
3. Encrypt tokens
4. Store OAuth identity

**Acceptance Criteria:**
- Service method handles LinkedIn login
- Tokens encrypted
- Identity stored correctly

---

### Task 3.5: Implement User Creation for LinkedIn
**ID:** TASK-002-15
**Priority:** High
**Dependencies:** TASK-002-14
**Estimate:** 15 minutes

**Description:** Create or find user from LinkedIn OAuth data.

**Steps:**
1. Check if OAuth identity exists
2. If exists, update tokens and return user
3. If email exists, link identity to existing user
4. If new, create user with profile and role

**Acceptance Criteria:**
- Users created correctly from LinkedIn data
- Existing users linked
- Profile and role assigned

---

### Task 3.6: Add Error Handling for LinkedIn OAuth
**ID:** TASK-002-16
**Priority:** Medium
**Dependencies:** TASK-002-15
**Estimate:** 15 minutes

**Description:** Implement comprehensive error handling for LinkedIn OAuth.

**Steps:**
1. Handle missing email from LinkedIn
2. Handle database errors
3. Handle token encryption errors
4. Log errors with context

**Acceptance Criteria:**
- All errors handled gracefully
- User-friendly messages displayed
- Errors logged for monitoring

---

## 5. Phase 4: User Management

### Task 4.1: Implement OAuth Token Encryption
**ID:** TASK-002-17
**Priority:** High
**Dependencies:** None
**Estimate:** 30 minutes

**Description:** Implement secure token encryption for OAuth tokens.

**Steps:**
1. Create `src/modules/auth/services/encryption.service.ts`
2. Implement AES-256 encryption method
3. Implement decryption method
4. Use environment variable for encryption key

**Acceptance Criteria:**
- Tokens encrypted with AES-256
- Encryption key from environment
- Decryption works correctly

---

### Task 4.2: Implement OAuthIdentity Management Service
**ID:** TASK-002-18
**Priority:** High
**Dependencies:** TASK-002-17
**Estimate:** 30 minutes

**Description:** Create service for managing OAuth identities.

**Steps:**
1. Create `src/modules/auth/services/oauth-identity.service.ts`
2. Implement `create` method
3. Implement `update` method
4. Implement `findByProvider` method
5. Implement `findByUser` method
6. Use encryption service for token storage

**Acceptance Criteria:**
- OAuth identities managed correctly
- Tokens encrypted before storage
- Query methods working

---

### Task 4.3: Implement Account Linking Logic
**ID:** TASK-002-19
**Priority:** High
**Dependencies:** TASK-002-18
**Estimate:** 20 minutes

**Description:** Implement logic for linking OAuth identities to existing users.

**Steps:**
1. In OAuth service, check for existing user by email
2. If found, create OAuth identity linked to user
3. Return existing user
4. Handle edge cases (multiple OAuth identities)

**Acceptance Criteria:**
- OAuth identity linked to existing user
- No duplicate OAuth identities
- User data preserved

---

### Task 4.4: Implement OAuth Profile Data Normalization
**ID:** TASK-002-20
**Priority:** Medium
**Dependencies:** TASK-002-18
**Estimate:** 15 minutes

**Description:** Normalize OAuth profile data from different providers.

**Steps:**
1. Create `OAuthProfileNormalizer` service
2. Map provider-specific fields to standard format
3. Handle missing fields gracefully
4. Extract email, name, and profile data

**Acceptance Criteria:**
- Profile data normalized
- Provider-specific handling
- Missing fields handled

---

### Task 4.5: Update AuthService for OAuth Login
**ID:** TASK-002-21
**Priority:** High
**Dependencies:** TASK-002-18, TASK-002-19
**Estimate:** 20 minutes

**Description:** Extend AuthService with OAuth login method.

**Steps:**
1. Add `handleOAuthLogin` method to AuthService
2. Use OAuthIdentityService for storage
3. Use UsersService for user management
4. Return user with JWT tokens

**Acceptance Criteria:**
- AuthService handles OAuth login
- User returned with tokens
- All services integrated

---

## 6. Phase 5: Testing

### Task 5.1: Write Unit Tests for Google Strategy
**ID:** TASK-002-22
**Priority:** High
**Dependencies:** TASK-002-05, TASK-002-06
**Estimate:** 30 minutes

**Description:** Write unit tests for Google OAuth strategy.

**Steps:**
1. Create `src/modules/auth/strategies/google.strategy.spec.ts`
2. Test successful validation
3. Test validation with missing data
4. Test validation with errors
5. Mock AuthService and ConfigService

**Acceptance Criteria:**
- All test cases pass
- ≥80% coverage for Google strategy
- Edge cases covered

---

### Task 5.2: Write Unit Tests for LinkedIn Strategy
**ID:** TASK-002-23
**Priority:** High
**Dependencies:** TASK-002-11, TASK-002-12
**Estimate:** 30 minutes

**Description:** Write unit tests for LinkedIn OAuth strategy.

**Steps:**
1. Create `src/modules/auth/strategies/linkedin.strategy.spec.ts`
2. Test successful validation
3. Test validation with missing data
4. Test validation with errors
5. Mock AuthService and ConfigService

**Acceptance Criteria:**
- All test cases pass
- ≥80% coverage for LinkedIn strategy
- Edge cases covered

---

### Task 5.3: Write Unit Tests for OAuth Service
**ID:** TASK-002-24
**Priority:** High
**Dependencies:** TASK-002-18, TASK-002-19
**Estimate:** 30 minutes

**Description:** Write unit tests for OAuth service.

**Steps:**
1. Create `src/modules/auth/services/oauth.service.spec.ts`
2. Test new user creation
3. Test existing user linking
4. Test OAuth identity update
5. Test error handling
6. Mock Prisma and encryption service

**Acceptance Criteria:**
- All test cases pass
- ≥80% coverage for OAuth service
- All edge cases covered

---

### Task 5.4: Write E2E Tests for OAuth Flows
**ID:** TASK-002-25
**Priority:** High
**Dependencies:** TASK-002-10, TASK-002-16, TASK-002-21
**Estimate:** 45 minutes

**Description:** Write end-to-end tests for OAuth authentication flows.

**Steps:**
1. Create `test/oauth.e2e-spec.ts`
2. Mock OAuth provider responses
3. Test Google OAuth flow
4. Test LinkedIn OAuth flow
5. Test error cases

**Acceptance Criteria:**
- All E2E tests pass
- Google and LinkedIn flows tested
- Error cases covered

---

## 7. Task Dependencies Graph

```
TASK-002-01 ──┬── TASK-002-02 ──┬── TASK-002-05 ──┬── TASK-002-06 ──┬── TASK-002-07 ──┬── TASK-002-08 ──┬── TASK-002-09 ──┬── TASK-002-10
              │                 │                 │                 │                 │                 │                 │
              ├── TASK-002-03   │                 │                 │                 │                 │                 │
              │                 ├── TASK-002-11 ──┬── TASK-002-12 ──┬── TASK-002-13 ──┬── TASK-002-14 ──┬── TASK-002-15 ──┬── TASK-002-16
              │                 │                 │                 │                 │                 │                 │
              └── TASK-002-04   └── TASK-002-17 ──┬── TASK-002-18 ──┬── TASK-002-19 ──┬── TASK-002-20 ──┬── TASK-002-21
                                                   │                 │                 │                 │
                                                   ├── TASK-002-22   │                 │                 │
                                                   ├── TASK-002-23   │                 │                 │
                                                   ├── TASK-002-24   │                 │                 │
                                                   └── TASK-002-25   └─────────────────┘
```

---

## 8. Validation Checklist

After completing all tasks, verify:

- [ ] `pnpm lint` passes with no errors
- [ ] `pnpm test` passes with ≥80% coverage
- [ ] `pnpm build` completes successfully
- [ ] Google OAuth flow works end-to-end
- [ ] LinkedIn OAuth flow works end-to-end
- [ ] OAuth identities stored correctly in database
- [ ] Tokens encrypted before storage
- [ ] New users created with profiles
- [ ] Existing users linked correctly
- [ ] Error handling works for all edge cases

---

## 9. Notes

- All commands assume `pnpm` as the package manager
- OAuth provider credentials must be obtained from Google and LinkedIn developer consoles
- Encryption key must be 64 characters (256 bits) in hex format
- All code must follow AGENTS.md guidelines
- OAuth callbacks should be configured in provider developer consoles
```

---

## Summary

I've created comprehensive Spec Kit files for Sprint 1:

### Feature 001: Project Initialization & JWT Authentication System
- **`spec.md`**: 9 sections including overview, user stories, functional requirements, non-functional requirements, acceptance criteria, dependencies, risks, and technical notes
- **`plan.md`**: 9 sections including technical context, architecture overview, implementation strategy (4 phases), API design, database changes, testing plan, configuration, quality gates, and references
- **`tasks.md`**: 28 tasks across 4 phases with dependencies, estimates, and validation checklist

### Feature 002: OAuth Integration (Google + LinkedIn)
- **`spec.md`**: 8 sections including overview, user stories, functional requirements, non-functional requirements, acceptance criteria, dependencies, risks, and technical notes
- **`plan.md`**: 11 sections including technical context, architecture overview, implementation strategy (5 phases), API design, strategy implementation, service implementation, database updates, testing plan, configuration, quality gates, and references
- **`tasks.md`**: 25 tasks across 5 phases with dependencies, estimates, and validation checklist

### Key Features of the Documentation:

1. **Professional Structure**: Following Spec Kit standards with clear separation of specification, planning, and task execution
2. **Comprehensive Coverage**: All Sprint 1 activities documented including database schema updates, JWT authentication, and OAuth integration
3. **Traceability**: User stories linked to functional requirements, tasks linked to deliverables
4. **Actionable Tasks**: Each task includes steps, acceptance criteria, and validation commands
5. **Dependencies**: Clear dependency graphs showing task relationships
6. **Quality Gates**: Validation checklists for completion criteria

The files are ready to be placed in the `specs/` directory structure at the root of the project.
