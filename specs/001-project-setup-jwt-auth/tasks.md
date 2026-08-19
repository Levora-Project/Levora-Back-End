
```markdown
# Tasks: Project Initialization & JWT Authentication System

**Feature ID:** 001
**Feature Name:** Project Initialization & JWT Authentication System
**Sprint:** 1
**Status:** Draft
**Created:** 2026-08-19
**Updated:** 2026-08-19

---

## 1. Task Summary

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1: Database Schema Setup | 8 tasks | 4 hours |
| Phase 2: Core Authentication | 8 tasks | 4 hours |
| Phase 3: User Profile Integration | 5 tasks | 2 hours |
| Phase 4: Testing and Documentation | 7 tasks | 3 hours |
| **Total** | **28 tasks** | **13 hours** |

---

## 2. Phase 1: Database Schema Setup

### Task 1.1: Update Prisma Schema with Levora Tables
**ID:** TASK-001-01
**Priority:** High
**Dependencies:** None
**Estimate:** 1 hour

**Description:**
Replace the existing Prisma schema with the complete Levora schema from Database Design v1.2.

**Steps:**
1. Open `prisma/schema.prisma`
2. Remove existing models (keeping generator and datasource)
3. Add all Levora models as defined in Database Design v1.2
4. Add `@map` for all fields to map camelCase to snake_case
5. Add `@@map` for all models
6. Add comments for documentation

**Acceptance Criteria:**
- All 21 Levora tables defined
- All fields use correct Prisma types
- All `@map` directives present
- Schema compiles with no errors

**Validation:**
```bash
pnpm prisma validate
```

---

### Task 1.2: Add Relation Definitions
**ID:** TASK-001-02
**Priority:** High
**Dependencies:** TASK-001-01
**Estimate:** 30 minutes

**Description:**
Add all relation definitions between models as defined in the ERD.

**Steps:**
1. Add `@relation` directives for all foreign key relationships
2. Define one-to-many, many-to-one, and many-to-many relationships
3. Set appropriate `onDelete` behaviors (Cascade, Restrict, SetNull)
4. Ensure the Users ↔ Roles M:N relationship is properly defined

**Acceptance Criteria:**
- All relationships match the ERD
- Referential integrity enforced at database level
- `onDelete` behaviors match requirements

**Validation:**
```bash
pnpm prisma validate
```

---

### Task 1.3: Add Field Mappings
**ID:** TASK-001-03
**Priority:** High
**Dependencies:** TASK-001-01
**Estimate:** 15 minutes

**Description:** Verify all fields have `@map` directives for snake_case naming.

**Steps:**
1. Review all model fields
2. Verify `@map` present for every field
3. Ensure column names match Database Design v1.2
4. Add missing mappings

**Acceptance Criteria:**
- Every field has `@map` where needed
- Column names match snake_case convention
- No naming inconsistencies

---

### Task 1.4: Create Database Migration
**ID:** TASK-001-04
**Priority:** High
**Dependencies:** TASK-001-01, TASK-001-02, TASK-001-03
**Estimate:** 15 minutes

**Description:** Generate and apply the initial migration.

**Steps:**
1. Run migration command:
   ```bash
   pnpm prisma migrate dev --name init_levora_schema
   ```
2. Review the generated SQL in `prisma/migrations/`
3. Apply the migration
4. Verify database schema

**Acceptance Criteria:**
- Migration completes successfully
- No errors during migration
- All tables created in database

**Validation:**
```bash
psql -d levora -c "\dt"
```

---

### Task 1.5: Generate Prisma Client
**ID:** TASK-001-05
**Priority:** High
**Dependencies:** TASK-001-04
**Estimate:** 5 minutes

**Description:** Generate the Prisma client for use in the application.

**Steps:**
1. Run generation command:
   ```bash
   pnpm prisma generate
   ```
2. Verify generated client in `node_modules/.prisma/client`

**Acceptance Criteria:**
- Prisma client generated successfully
- No generation errors

---

### Task 1.6: Create Seed Data Script
**ID:** TASK-001-06
**Priority:** High
**Dependencies:** TASK-001-04
**Estimate:** 30 minutes

**Description:** Create a seed script to populate the Roles table.

**Steps:**
1. Create `prisma/seed.ts` file
2. Write script to insert roles: `user`, `content_admin`, `system_admin`
3. Add `ts-node` configuration for running seeds
4. Update `package.json` with seed command

**Acceptance Criteria:**
- Seed script runs successfully
- Roles inserted correctly
- Script is idempotent

**Validation:**
```bash
pnpm prisma db seed
```

---

### Task 1.7: Add Database Indexes
**ID:** TASK-001-07
**Priority:** Medium
**Dependencies:** TASK-001-04
**Estimate:** 30 minutes

**Description:** Add all recommended indexes from Database Design v1.2.

**Steps:**
1. Review index recommendations in Database Design
2. Add `@@index` directives to relevant models
3. Create migration for indexes

**Acceptance Criteria:**
- All 27 indexes from Database Design included
- Indexes created in database

**Validation:**
```bash
psql -d levora -c "\di"
```

---

### Task 1.8: Verify Database Schema
**ID:** TASK-001-08
**Priority:** High
**Dependencies:** TASK-001-04, TASK-001-05, TASK-001-06, TASK-001-07
**Estimate:** 30 minutes

**Description:** Thoroughly verify the database schema matches requirements.

**Steps:**
1. Check all tables exist with correct columns
2. Verify data types match specifications
3. Confirm foreign key constraints exist
4. Confirm indexes are present
5. Verify seed data

**Acceptance Criteria:**
- All 21 tables present
- All columns have correct types
- All constraints in place
- All indexes present
- Roles seeded correctly

---

## 3. Phase 2: Core Authentication Implementation

### Task 2.1: Install Dependencies
**ID:** TASK-002-01
**Priority:** High
**Dependencies:** TASK-001-08
**Estimate:** 5 minutes

**Description:** Install all required dependencies for JWT authentication.

**Steps:**
```bash
pnpm add @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
pnpm add -D @types/passport-jwt @types/bcrypt
```

**Acceptance Criteria:**
- All dependencies installed
- No installation errors

---

### Task 2.2: Configure Environment Variables
**ID:** TASK-002-02
**Priority:** High
**Dependencies:** TASK-002-01
**Estimate:** 15 minutes

**Description:** Update environment configuration for JWT.

**Steps:**
1. Update `config/configuration.ts` with JWT settings
2. Create `.env.example` with required variables
3. Update `.env` locally

**Acceptance Criteria:**
- All JWT environment variables defined
- Configuration module loads variables correctly
- `.env.example` updated

---

### Task 2.3: Implement JWT Strategy
**ID:** TASK-002-03
**Priority:** High
**Dependencies:** TASK-002-02
**Estimate:** 30 minutes

**Description:** Implement the JWT strategy for Passport.

**Steps:**
1. Create `src/modules/auth/strategies/jwt.strategy.ts`
2. Extend `PassportStrategy(Strategy, 'jwt')`
3. Implement `validate` method
4. Inject configuration service

**Acceptance Criteria:**
- JWT strategy validates tokens correctly
- Returns user object on validation
- Handles invalid tokens gracefully

---

### Task 2.4: Implement JWT Auth Guard
**ID:** TASK-002-04
**Priority:** High
**Dependencies:** TASK-002-03
**Estimate:** 30 minutes

**Description:** Implement the JWT authentication guard.

**Steps:**
1. Create `src/modules/auth/guards/jwt-auth.guard.ts`
2. Extend `AuthGuard('jwt')`
3. Implement `handleRequest` for custom error handling
4. Register guard globally in `AppModule`

**Acceptance Criteria:**
- Guard protects routes by default
- Unauthenticated requests return 401
- Valid tokens allow access

---

### Task 2.5: Implement @Public Decorator
**ID:** TASK-002-05
**Priority:** High
**Dependencies:** TASK-002-04
**Estimate:** 15 minutes

**Description:** Implement a decorator to mark public routes.

**Steps:**
1. Create `src/modules/auth/decorators/public.decorator.ts`
2. Use `SetMetadata` with `IS_PUBLIC_KEY`
3. Implement `isPublic` check in guard

**Acceptance Criteria:**
- `@Public()` decorator available
- Routes with `@Public()` bypass authentication
- All other routes require authentication

---

### Task 2.6: Implement DTOs
**ID:** TASK-002-06
**Priority:** High
**Dependencies:** TASK-002-05
**Estimate:** 45 minutes

**Description:** Create all DTOs for authentication.

**Steps:**
1. Create `RegisterDto` with validation
2. Create `LoginDto` with validation
3. Create `RefreshTokenDto` with validation
4. Create `UserResponseDto` (excludes sensitive fields)

**Acceptance Criteria:**
- All DTOs use `class-validator` decorators
- Validation messages are clear and user-friendly
- `UserResponseDto` excludes password and tokens

---

### Task 2.7: Implement AuthService
**ID:** TASK-002-07
**Priority:** High
**Dependencies:** TASK-002-02, TASK-002-06
**Estimate:** 1 hour

**Description:** Implement the authentication service.

**Steps:**
1. Create `src/modules/auth/services/auth.service.ts`
2. Implement `validateUser` method
3. Implement `register` method
4. Implement `login` method
5. Implement `refreshToken` method
6. Implement `getProfile` method
7. Use bcrypt for password hashing/verification
8. Use JwtService for token generation

**Acceptance Criteria:**
- Register creates user and profile
- Login validates credentials and returns tokens
- Refresh generates new access token
- GetProfile returns user data with profile

---

### Task 2.8: Implement AuthController
**ID:** TASK-002-08
**Priority:** High
**Dependencies:** TASK-002-07
**Estimate:** 1 hour

**Description:** Implement the authentication controller.

**Steps:**
1. Create `src/modules/auth/controllers/auth.controller.ts`
2. Implement `POST /auth/register` endpoint
3. Implement `POST /auth/login` endpoint
4. Implement `POST /auth/refresh` endpoint
5. Implement `GET /auth/me` endpoint
6. Use `@Public()` for public endpoints
7. Apply `@UseGuards(JwtAuthGuard)` for protected endpoints

**Acceptance Criteria:**
- All endpoints functional
- Correct HTTP status codes returned
- Standardized response format used
- Error handling implemented

---

## 4. Phase 3: User Profile Integration

### Task 3.1: Implement UsersService
**ID:** TASK-003-01
**Priority:** High
**Dependencies:** TASK-001-08
**Estimate:** 1 hour

**Description:** Implement the users service for profile management.

**Steps:**
1. Create `src/modules/users/services/users.service.ts`
2. Implement `findByEmail` method
3. Implement `findById` method
4. Implement `createUser` method
5. Implement `createProfile` method
6. Implement `getUserWithProfile` method

**Acceptance Criteria:**
- Users can be queried by email and ID
- Users can be created with profiles
- Profile data accessible via user

---

### Task 3.2: Implement Automatic Profile Creation
**ID:** TASK-003-02
**Priority:** High
**Dependencies:** TASK-003-01
**Estimate:** 15 minutes

**Description:** Ensure user profiles are created automatically on registration.

**Steps:**
1. Modify `AuthService.register` to create profile
2. Use `UsersService.createProfile` after user creation
3. Set default values for profile fields

**Acceptance Criteria:**
- Profile created for every new user
- Profile has correct userId reference
- Default values set appropriately

---

### Task 3.3: Implement UsersController
**ID:** TASK-003-03
**Priority:** Medium
**Dependencies:** TASK-003-02
**Estimate:** 30 minutes

**Description:** Implement user-related endpoints.

**Steps:**
1. Create `src/modules/users/controllers/users.controller.ts`
2. Implement `GET /users/:id` (admin only)
3. Implement `GET /users/profile` (own profile)

**Acceptance Criteria:**
- Profile endpoint returns user data
- Users can only access their own data
- Authorization enforced

---

### Task 3.4: Update AuthService Integration
**ID:** TASK-003-04
**Priority:** High
**Dependencies:** TASK-003-02
**Estimate:** 15 minutes

**Description:** Ensure AuthService uses UsersService correctly.

**Steps:**
1. Inject UsersService into AuthService
2. Use UsersService for user queries
3. Use UsersService for profile creation
4. Remove direct Prisma calls from AuthService

**Acceptance Criteria:**
- AuthService delegates to UsersService
- Single source of truth for user operations
- No direct Prisma access in AuthService

---

### Task 3.5: Create User Module
**ID:** TASK-003-05
**Priority:** High
**Dependencies:** TASK-003-01, TASK-003-03
**Estimate:** 15 minutes

**Description:** Create the Users module and register it.

**Steps:**
1. Create `src/modules/users/users.module.ts`
2. Register UsersService and UsersController
3. Export UsersService for use in AuthModule
4. Import UsersModule in AppModule

**Acceptance Criteria:**
- Users module configured correctly
- UsersService available for injection
- Module registered in application

---

## 5. Phase 4: Testing and Documentation

### Task 4.1: Write Unit Tests for AuthService
**ID:** TASK-004-01
**Priority:** High
**Dependencies:** TASK-002-07
**Estimate:** 1 hour

**Description:** Write comprehensive unit tests for AuthService.

**Steps:**
1. Create `src/modules/auth/services/auth.service.spec.ts`
2. Test registration (success, duplicate email, weak password)
3. Test login (success, invalid credentials)
4. Test refresh token (success, invalid token)
5. Test profile retrieval (success, unauthorized)
6. Use mocks for UsersService and JwtService

**Acceptance Criteria:**
- All test cases pass
- ≥80% coverage for AuthService
- All edge cases covered

---

### Task 4.2: Write Unit Tests for UsersService
**ID:** TASK-004-02
**Priority:** High
**Dependencies:** TASK-003-01
**Estimate:** 45 minutes

**Description:** Write comprehensive unit tests for UsersService.

**Steps:**
1. Create `src/modules/users/services/users.service.spec.ts`
2. Test user creation
3. Test profile creation
4. Test user retrieval by email and ID
5. Test user with profile retrieval

**Acceptance Criteria:**
- All test cases pass
- ≥80% coverage for UsersService
- All edge cases covered

---

### Task 4.3: Write E2E Tests
**ID:** TASK-004-03
**Priority:** High
**Dependencies:** TASK-002-08, TASK-003-05
**Estimate:** 1 hour

**Description:** Write end-to-end tests for authentication endpoints.

**Steps:**
1. Create `test/auth.e2e-spec.ts`
2. Test registration endpoint
3. Test login endpoint
4. Test refresh endpoint
5. Test profile endpoint
6. Test protected route access
7. Test invalid token handling

**Acceptance Criteria:**
- All E2E tests pass
- Tests run in isolation
- Test database used for E2E

---

### Task 4.4: Configure Swagger Documentation
**ID:** TASK-004-04
**Priority:** High
**Dependencies:** TASK-002-08
**Estimate:** 30 minutes

**Description:** Set up Swagger/OpenAPI documentation.

**Steps:**
1. Install Swagger: `pnpm add @nestjs/swagger`
2. Configure Swagger in `main.ts`
3. Add `@ApiTags`, `@ApiOperation`, `@ApiResponse` decorators
4. Document all DTOs with examples
5. Make Swagger UI available at `/api`

**Acceptance Criteria:**
- Swagger UI accessible at `/api`
- All endpoints documented
- Request/response examples included
- API documented in OpenAPI format

---

### Task 4.5: Export Postman Collection
**ID:** TASK-004-05
**Priority:** Medium
**Dependencies:** TASK-004-04
**Estimate:** 15 minutes

**Description:** Export Postman collection from Swagger.

**Steps:**
1. Access `/api-json` endpoint
2. Save OpenAPI specification
3. Import into Postman
4. Export collection with environments
5. Save to `docs/Levora_API.postman_collection.json`

**Acceptance Criteria:**
- Postman collection exported
- Collection includes all endpoints
- Collection works with local environment

---

### Task 4.6: Configure SonarQube
**ID:** TASK-004-06
**Priority:** Medium
**Dependencies:** TASK-001-08, TASK-002-08, TASK-003-05
**Estimate:** 30 minutes

**Description:** Set up SonarQube for static code analysis.

**Steps:**
1. Add SonarQube configuration file (`sonar-project.properties`)
2. Configure analysis parameters
3. Run analysis: `pnpm sonar`
4. Review and address issues

**Acceptance Criteria:**
- SonarQube analysis runs without errors
- No critical vulnerabilities found
- Code quality meets standards

---

### Task 4.7: Implement Health Checks
**ID:** TASK-004-07
**Priority:** Medium
**Dependencies:** TASK-001-08
**Estimate:** 30 minutes

**Description:** Implement health check endpoints.

**Steps:**
1. Create `src/modules/health/health.controller.ts`
2. Implement `GET /health` endpoint
3. Implement `GET /health/ready` endpoint
4. Add database connection check
5. Add system status check

**Acceptance Criteria:**
- Health endpoints accessible without authentication
- Database status correctly reported
- System status correctly reported

---

## 6. Task Dependencies Graph

```
TASK-001-01 ─┬─ TASK-001-02 ─┬─ TASK-001-04 ─┬─ TASK-001-05
             │                │               ├─ TASK-001-06
             ├─ TASK-001-03 ──┘               ├─ TASK-001-07
                                              └─ TASK-001-08
                                                     │
                                                     ├─ TASK-002-01 ─┬─ TASK-002-02 ─┬─ TASK-002-03 ─┬─ TASK-002-04 ─┬─ TASK-002-05 ─┬─ TASK-002-06 ─┬─ TASK-002-07 ─┬─ TASK-002-08
                                                     │               │               │               │               │               │               │               │
                                                     │               │               │               │               │               │               │               └─ TASK-004-03
                                                     │               │               │               │               │               │               │
                                                     │               │               │               │               │               │               └─ TASK-003-02
                                                     │               │               │               │               │               │
                                                     │               │               │               │               │               └─ TASK-004-01
                                                     │               │               │               │               │
                                                     │               │               │               │               └─ TASK-004-04
                                                     │               │               │               │
                                                     │               │               │               └─ TASK-004-05
                                                     │               │               │
                                                     │               │               └─ TASK-004-06
                                                     │               │
                                                     │               └─ TASK-003-04
                                                     │
                                                     ├─ TASK-003-01 ─┬─ TASK-003-02 ─┬─ TASK-003-04
                                                     │               │               │
                                                     │               │               └─ TASK-003-05
                                                     │               │
                                                     │               └─ TASK-004-02
                                                     │
                                                     └─ TASK-004-07
```

---

## 7. Validation Checklist

After completing all tasks, verify:

- [ ] `pnpm lint` passes with no errors
- [ ] `pnpm test` passes with ≥80% coverage
- [ ] `pnpm build` completes successfully
- [ ] All database migrations applied successfully
- [ ] Swagger UI accessible at `/api`
- [ ] Postman collection exported and functional
- [ ] SonarQube analysis passes
- [ ] Health checks respond successfully
- [ ] All endpoints functional and documented

---

## 8. Notes

- All commands assume `pnpm` as the package manager
- Test database should be configured separately from development database
- Environment variables must be set before running the application
- The `@maholan/nestjs-template` provides the base structure
- All code must follow AGENTS.md guidelines
```

---

# Feature 2: OAuth Integration (Google + LinkedIn)

