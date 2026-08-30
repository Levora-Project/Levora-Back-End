# Tasks: Profile Creation & Management (Backend)

**Feature ID:** 003
**Feature Name:** Profile Creation & Management
**Sprint:** 2
**Status:** Draft
**Created:** 2026-08-30
**Updated:** 2026-08-30

---

## 1. Task Summary

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1: Database & Reference Data | 5 tasks | 2.5 hours |
| Phase 2: Profile CRUD | 8 tasks | 4 hours |
| Phase 3: GPA Normalization | 4 tasks | 1.5 hours |
| Phase 4: Storage Service | 4 tasks | 2 hours |
| Phase 5: Document Management | 6 tasks | 3 hours |
| Phase 6: Testing & Documentation | 5 tasks | 2.5 hours |
| **Total** | **32 tasks** | **15.5 hours** |

---

## 2. Phase 1: Database & Reference Data

### Task 1.1: Add Reference Tables to Prisma Schema
**ID:** TASK-003-01
**Priority:** High
**Dependencies:** None
**Estimate:** 30 minutes

**Description:**
Add `FieldOfStudy` and `Skill` (or extend `SkillsMaster`) models to `prisma/schema.prisma`.

**Steps:**
1. Open `prisma/schema.prisma`.
2. Add `FieldOfStudy` model with fields: `id`, `name` (unique), `category`, `isActive`.
3. Add `Skill` model (or add `category` to existing `SkillsMaster`).
4. If extending `SkillsMaster`, add `category` field with `@map("category")` and `isActive` if not present.
5. Run `pnpm prisma validate` to ensure schema is valid.

**Acceptance Criteria:**
- Schema compiles without errors.
- Models are correctly mapped with `@@map` to snake_case.
- Fields have appropriate types and constraints.

---

### Task 1.2: Create Database Migration
**ID:** TASK-003-02
**Priority:** High
**Dependencies:** TASK-003-01
**Estimate:** 15 minutes

**Description:**
Generate and apply migration for reference tables.

**Steps:**
1. Run: `pnpm prisma migrate dev --name add_reference_tables`
2. Review generated SQL in `prisma/migrations/`.
3. Verify tables are created: `fields_of_study` and `skills` (or `skills_master` updated).

**Acceptance Criteria:**
- Migration completes without errors.
- Tables exist in database with correct columns.

---

### Task 1.3: Seed Reference Data
**ID:** TASK-003-03
**Priority:** High
**Dependencies:** TASK-003-02
**Estimate:** 30 minutes

**Description:**
Add seed data for fields of study and skills taxonomy.

**Steps:**
1. Open `prisma/seed.ts`.
2. Add arrays of fields of study and skills with categories.
3. Use `upsert` for each item to ensure idempotency.
4. Run `pnpm prisma db seed` to populate data.
5. Verify data in database.

**Acceptance Criteria:**
- 15+ fields of study seeded.
- 25+ skills seeded across 6 categories (Tech, Business, Arts, Science, Engineering, Healthcare).
- Seed script is idempotent.

---

### Task 1.4: Scaffold Profile Module
**ID:** TASK-003-04
**Priority:** High
**Dependencies:** None
**Estimate:** 15 minutes

**Description:**
Create the Profile module with basic structure.

**Steps:**
1. Run NestJS generator:
   ```bash
   npx nest g module modules/profile
   npx nest g controller modules/profile/profile
   npx nest g service modules/profile/profile
   ```
2. Create subdirectories: `dto/`, `interfaces/`, `storage/`.
3. Register `ProfileModule` in `AppModule`.

**Acceptance Criteria:**
- Module structure matches the plan.
- `ProfileModule` imported in `AppModule`.
- Build succeeds.

---

### Task 1.5: Implement ReferenceService
**ID:** TASK-003-05
**Priority:** High
**Dependencies:** TASK-003-03, TASK-003-04
**Estimate:** 1 hour

**Description:**
Implement service and controller for reference data endpoints.

**Steps:**
1. Create `src/modules/profile/services/reference.service.ts`.
2. Implement `getFieldsOfStudy()` reading from `FieldOfStudy` model.
3. Implement `getSkillsTaxonomy()` reading from `Skill` model grouped by category.
4. Create `src/modules/profile/controllers/reference.controller.ts`.
5. Implement `GET /reference/fields-of-study` with `@Public()` decorator.
6. Implement `GET /reference/skills-taxonomy` with `@Public()` decorator.
7. Add Swagger documentation.

**Acceptance Criteria:**
- Both endpoints return data from database.
- Endpoints are public (no authentication required).
- Swagger documentation present.
- Response format matches API contract.

---

## 3. Phase 2: Profile CRUD

### Task 2.1: Implement ProfileService - Core Methods
**ID:** TASK-003-06
**Priority:** High
**Dependencies:** TASK-003-04
**Estimate:** 1 hour

**Description:**
Implement `getProfile`, `getProfileWithDetails`, and `updateProfile` in `ProfileService`.

**Steps:**
1. Create `src/modules/profile/services/profile.service.ts`.
2. Implement `getProfile(userId: string)`:
   - Query `UserProfiles` with nested relations: `educations`, `skills`, `languages`, `documents`.
   - Return full profile data.
3. Implement `getProfileWithDetails(userId: string)` including calculated fields.
4. Implement `updateProfile(userId: string, data: UpdateProfileDto)`:
   - Use `prisma.userProfiles.update` with nested updates.
   - Handle array fields (fieldOfStudy, skills, languages) by replacing.
5. Handle case where profile doesn't exist (should never happen, but create if missing).

**Acceptance Criteria:**
- Service methods work correctly.
- Nested relations included.
- Array fields replaced (not merged).

---

### Task 2.2: Implement Core Fields Validation
**ID:** TASK-003-07
**Priority:** High
**Dependencies:** TASK-003-06
**Estimate:** 30 minutes

**Description:**
Add validation logic for required core fields.

**Steps:**
1. Add `isCoreFieldsComplete(profile: UserProfiles): boolean` method.
2. Logic: `educationLevel` not null AND `fieldOfStudy` is non-empty array AND `nationality` not null.
3. In `updateProfile`, reject clearing any required field that was previously set.
4. Add validation error: "Cannot clear required field X" with 400.

**Acceptance Criteria:**
- `coreFieldsComplete` calculated correctly.
- Required fields cannot be cleared to null once set.
- Invalid attempts return 400 with descriptive error.

---

### Task 2.3: Implement Profile Completion Percentage
**ID:** TASK-003-08
**Priority:** High
**Dependencies:** TASK-003-06
**Estimate:** 30 minutes

**Description:**
Calculate profile completion percentage based on weighted field list.

**Steps:**
1. Define field weights in a constant (see spec.md Section 8.3).
2. Add `calculateCompletionPct(profile: any): number` method.
3. Evaluate each field and add weight if present/valid.
4. Return total percentage (0–100).
5. Include in `getProfile` response.

**Acceptance Criteria:**
- Completion percentage matches spec weights.
- Empty profile returns 0%.
- Full profile returns 100%.

---

### Task 2.4: Implement Last Completed Step
**ID:** TASK-003-09
**Priority:** Medium
**Dependencies:** TASK-003-06
**Estimate:** 15 minutes

**Description:**
Calculate the highest wizard step that has been completed.

**Steps:**
1. Add `calculateLastCompletedStep(profile: any): number` method.
2. Logic:
   - Step 1 (Education): educationLevel AND fieldOfStudy AND nationality (partial: educationLevel + nationality).
   - Step 2 (Background): experienceLevel OR hasFinancialNeed OR careerGoals.
   - Step 3 (Skills & Language): at least 1 skill AND at least 1 language.
   - Step 4 (Documents): at least 1 document uploaded.
3. Return highest number (1-4) where conditions are met.

**Acceptance Criteria:**
- Last completed step calculated correctly.
- Empty profile returns 1 (if nationality set) or 0.

---

### Task 2.5: Implement ProfileController - GET /profile
**ID:** TASK-003-10
**Priority:** High
**Dependencies:** TASK-003-06, TASK-003-07, TASK-003-08
**Estimate:** 15 minutes

**Description:**
Implement `GET /profile` endpoint returning full profile data.

**Steps:**
1. Create `src/modules/profile/controllers/profile.controller.ts`.
2. Add `@Get()` method with `@UseGuards(JwtAuthGuard)`.
3. Extract `userId` from `req.user`.
4. Call `ProfileService.getProfileWithDetails(userId)`.
5. Return standardized response with 200 status.

**Acceptance Criteria:**
- Endpoint returns 200 with full profile.
- Always returns profile (never 404).
- Response includes calculated fields.
- Swagger documentation present.

---

### Task 2.6: Implement ProfileController - PATCH /profile
**ID:** TASK-003-11
**Priority:** High
**Dependencies:** TASK-003-06, TASK-003-07
**Estimate:** 30 minutes

**Description:**
Implement `PATCH /profile` endpoint for partial updates.

**Steps:**
1. Create `UpdateProfileDto` with all optional fields and validation.
2. Add `@Patch()` method with `@UseGuards(JwtAuthGuard)`.
3. Extract `userId` from `req.user`.
4. Validate DTO (class-validator).
5. Call `ProfileService.updateProfile(userId, data)`.
6. Handle validation errors (400), not found (404 should not happen).

**Acceptance Criteria:**
- Endpoint updates only provided fields.
- Validation rejects invalid data.
- Required fields cannot be cleared.
- Returns updated profile summary.
- Swagger documentation present.

---

### Task 2.7: Create UpdateProfileDto
**ID:** TASK-003-12
**Priority:** High
**Dependencies:** TASK-003-11
**Estimate:** 30 minutes

**Description:**
Create the DTO with class-validator decorators.

**Steps:**
1. Create `src/modules/profile/dto/update-profile.dto.ts`.
2. Add fields: `fullName`, `dateOfBirth`, `nationality`, `educationLevel`, `fieldOfStudy`, `currentCountry`, `currentCity`, `phone`, `experienceLevel`, `hasFinancialNeed`, `careerGoals`, `profilePhotoUrl`.
3. Use `@IsOptional()`, `@IsString()`, `@IsArray()`, `@IsBoolean()`, `@IsDateString()`, `@Length()`, `@ArrayMaxSize()`.
4. For `fieldOfStudy`: `@ArrayMaxSize(5)`.
5. For nested `skills`: create `SkillDto` with `skillId` and `proficiency`.
6. For nested `languages`: create `LanguageDto` with `languageId` and `proficiency`.

**Acceptance Criteria:**
- All fields have appropriate validators.
- Array size limits enforced.
- Nested DTOs defined.

---

### Task 2.8: Handle Multi-Value Fields in Update
**ID:** TASK-003-13
**Priority:** High
**Dependencies:** TASK-003-06, TASK-003-12
**Estimate:** 45 minutes

**Description:**
Implement replacement logic for `skills`, `languages`, and `fieldOfStudy`.

**Steps:**
1. In `updateProfile`, detect which fields are provided.
2. For `skills`: delete all existing `UserSkills` for the user, then create new ones.
3. For `languages`: delete all existing `UserLanguages`, then create new ones.
4. For `fieldOfStudy`: replace array directly.
5. Use `prisma.$transaction` to ensure atomicity.
6. Validate that skillId and languageId exist in master tables.

**Acceptance Criteria:**
- Skills replaced completely (not merged).
- Languages replaced completely.
- Invalid skillId/languageId returns 400.
- All operations atomic.

---

## 4. Phase 3: GPA Normalization

### Task 3.1: Create GPA Normalization Utility
**ID:** TASK-003-14
**Priority:** High
**Dependencies:** None
**Estimate:** 30 minutes

**Description:**
Create GPA normalization utility functions in `src/common/utils/gpa-normalizer.ts`.

**Steps:**
1. Create `src/common/utils/gpa-normalizer.ts`.
2. Implement `validateGPARange(value: number, scale: '4.0' | 'percentage' | 'letter'): boolean`.
3. Implement `normalizeGPA(value: number | string, scale: '4.0' | 'percentage' | 'letter'): number`.
4. Implement `parseLetterGrade(letter: string): number`.
5. Export all functions.

**Acceptance Criteria:**
- All functions work correctly.
- Range validation rejects invalid values.
- Normalization follows spec mapping.
- No external dependencies.

---

### Task 3.2: Write Unit Tests for GPA Utility
**ID:** TASK-003-15
**Priority:** High
**Dependencies:** TASK-003-14
**Estimate:** 30 minutes

**Description:**
Write comprehensive unit tests for GPA normalization.

**Steps:**
1. Create `src/common/utils/gpa-normalizer.spec.ts`.
2. Test `validateGPARange` for all scales (valid and invalid).
3. Test `normalizeGPA` for all scales.
4. Test `parseLetterGrade` for all letter grades (A+, A, A-, ..., F).
5. Test edge cases: empty string, null, undefined.

**Acceptance Criteria:**
- 100% coverage of all functions.
- All test cases pass.

---

### Task 3.3: Integrate GPA into Profile Updates
**ID:** TASK-003-16
**Priority:** High
**Dependencies:** TASK-003-14, TASK-003-12
**Estimate:** 30 minutes

**Description:**
Add GPA handling to `ProfileService.updateProfile`.

**Steps:**
1. Extend `UpdateProfileDto` with GPA fields: `gpaValue`, `gpaScale`.
2. In `updateProfile`, when GPA fields are provided:
   - Validate range using `validateGPARange`.
   - Normalize using `normalizeGPA`.
   - Store normalized value in `gpaNormalized4` on `UserEducations`.
3. If scale changes, clear existing GPA value (per FR-003-20).

**Acceptance Criteria:**
- GPA accepted on all three scales.
- Invalid ranges return 400.
- Normalization works correctly.
- Scale change clears value.

---

### Task 3.4: Add GPA to Profile Response
**ID:** TASK-003-17
**Priority:** High
**Dependencies:** TASK-003-16
**Estimate:** 15 minutes

**Description:**
Include normalized GPA in `GET /profile` response.

**Steps:**
1. Modify `getProfileWithDetails` to include `gpaNormalized4`.
2. If multiple educations, use the most recent or highest (spec is silent; default to first).
3. Return `null` if no GPA set.

**Acceptance Criteria:**
- `gpaNormalized4` included in response.
- `null` when no GPA set.

---

## 5. Phase 4: Storage Service

### Task 4.1: Define StorageService Interface
**ID:** TASK-003-18
**Priority:** High
**Dependencies:** None
**Estimate:** 15 minutes

**Description:**
Create the storage service interface.

**Steps:**
1. Create `src/modules/profile/interfaces/storage.interface.ts`.
2. Define interface:
   ```typescript
   export interface StorageService {
     upload(file: Buffer, filename: string, mimeType: string): Promise<{ key: string; url?: string }>;
     download(key: string): Promise<Buffer>;
     delete(key: string): Promise<void>;
     getSignedUrl(key: string, expiresIn: number): Promise<string>;
   }
   ```

**Acceptance Criteria:**
- Interface defined with proper types.
- Methods documented with JSDoc.

---

### Task 4.2: Implement LocalStorageService
**ID:** TASK-003-19
**Priority:** High
**Dependencies:** TASK-003-18
**Estimate:** 30 minutes

**Description:**
Implement local filesystem storage provider.

**Steps:**
1. Create `src/modules/profile/storage/local-storage.service.ts`.
2. Implement `upload`: write file to `LOCAL_UPLOAD_PATH` with UUID filename.
3. Implement `download`: read file from disk.
4. Implement `delete`: remove file from disk.
5. Implement `getSignedUrl`: return a local URL with a token (use JWT or simple hash).

**Acceptance Criteria:**
- Files stored in configured path.
- Files read and deleted correctly.
- Signed URL works (requires middleware to validate token).

---

### Task 4.3: Implement S3StorageService
**ID:** TASK-003-20
**Priority:** High
**Dependencies:** TASK-003-18
**Estimate:** 30 minutes

**Description:**
Implement AWS S3 storage provider.

**Steps:**
1. Create `src/modules/profile/storage/s3-storage.service.ts`.
2. Use `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`.
3. Implement `upload`: `PutObjectCommand` with `ServerSideEncryption: 'AES256'`.
4. Implement `download`: `GetObjectCommand`.
5. Implement `delete`: `DeleteObjectCommand`.
6. Implement `getSignedUrl`: `getSignedUrl` with `GetObjectCommand` and `expiresIn`.

**Acceptance Criteria:**
- Files uploaded to S3 bucket.
- Server-side encryption enabled.
- Signed URLs generated with expiration.
- All AWS credentials loaded from config.

---

### Task 4.4: Implement StorageService Factory
**ID:** TASK-003-21
**Priority:** High
**Dependencies:** TASK-003-19, TASK-003-20
**Estimate:** 15 minutes

**Description:**
Create storage service factory to select the appropriate provider.

**Steps:**
1. Create `src/modules/profile/storage/storage.service.ts`.
2. Use `@Injectable()` with `useFactory` in module definition.
3. Based on `STORAGE_PROVIDER` env, instantiate the correct implementation.
4. Validate configuration at startup (fail fast).

**Acceptance Criteria:**
- Service selected based on configuration.
- Validation fails with clear error if misconfigured.
- Factory registered in `ProfileModule`.

---

## 6. Phase 5: Document Management

### Task 5.1: Implement Encryption Utilities
**ID:** TASK-003-22
**Priority:** High
**Dependencies:** TASK-003-21
**Estimate:** 30 minutes

**Description:**
Create encryption/decryption utilities for document storage.

**Steps:**
1. Create `src/modules/profile/utils/encryption.util.ts`.
2. Implement `encryptFile(buffer: Buffer, key: string): { encrypted: Buffer; iv: string }`.
3. Implement `decryptFile(encrypted: Buffer, key: string, iv: string): Buffer`.
4. Use AES-256-CBC with random IV per file.

**Acceptance Criteria:**
- Encryption works and is reversible.
- IV stored separately (in database or combined with encrypted data).
- Unit tests for encryption/decryption.

---

### Task 5.2: Implement DocumentsService
**ID:** TASK-003-23
**Priority:** High
**Dependencies:** TASK-003-21, TASK-003-22
**Estimate:** 1 hour

**Description:**
Implement document management service.

**Steps:**
1. Create `src/modules/profile/services/documents.service.ts`.
2. Implement `uploadDocument(userId: string, file: Express.Multer.File, docType: string)`:
   - Validate file size (max 5MB).
   - Validate MIME type using `file-type`.
   - Generate UUID filename.
   - Encrypt file content.
   - Upload to storage.
   - Create database record.
3. Implement `getDocument(userId: string, documentId: string)` with ownership check.
4. Implement `getDownloadUrl(userId: string, documentId: string)`:
   - Ownership check.
   - Get signed URL from storage.
5. Implement `deleteDocument(userId: string, documentId: string)`:
   - Ownership check.
   - Delete from storage.
   - Delete database record.
6. Implement `getDocuments(userId: string)`: list all documents.

**Acceptance Criteria:**
- All operations have ownership checks.
- Files validated and encrypted.
- Database records created.
- Download URLs are signed.

---

### Task 5.3: Implement File Validation Middleware
**ID:** TASK-003-24
**Priority:** High
**Dependencies:** TASK-003-23
**Estimate:** 30 minutes

**Description:**
Create multer configuration with file validation.

**Steps:**
1. Create `src/modules/profile/middleware/upload.middleware.ts` or config in controller.
2. Use `multer` with `limits: { fileSize: 5 * 1024 * 1024 }`.
3. Implement `fileFilter`:
   - Check file extension.
   - Use `file-type` to read magic bytes.
   - Ensure MIME type matches extension.
   - Allow: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `image/png`, `image/jpeg`.
4. Reject with 400 if validation fails.

**Acceptance Criteria:**
- File size limit enforced.
- MIME type validated by signature.
- Rejects renamed malicious files.

---

### Task 5.4: Implement DocumentsController
**ID:** TASK-003-25
**Priority:** High
**Dependencies:** TASK-003-23, TASK-003-24
**Estimate:** 45 minutes

**Description:**
Implement document endpoints.

**Steps:**
1. Create `src/modules/profile/controllers/documents.controller.ts`.
2. Implement `POST /profile/documents`:
   - Use `@UseInterceptors(FileInterceptor('file'))`.
   - Extract `documentType` from body.
   - Call `DocumentsService.uploadDocument`.
   - Return 201 with document metadata.
3. Implement `GET /profile/documents/:id/download`:
   - Call `DocumentsService.getDownloadUrl`.
   - Return signed URL (not the file directly).
4. Implement `DELETE /profile/documents/:id`:
   - Call `DocumentsService.deleteDocument`.
   - Return 200.
5. Implement `GET /profile/documents` (optional) to list all documents.

**Acceptance Criteria:**
- All endpoints protected by JWT.
- Ownership enforced.
- Swagger documentation present.
- Response formats match API contract.

---

### Task 5.5: Document Count Limit Enforcement
**ID:** TASK-003-26
**Priority:** Medium
**Dependencies:** TASK-003-23
**Estimate:** 15 minutes

**Description:**
Enforce maximum documents per user (soft cap of 20).

**Steps:**
1. In `DocumentsService.uploadDocument`, count existing documents for the user.
2. If count >= `MAX_DOCUMENTS_PER_USER`, return 400 with error.
3. Use configuration value (from env).

**Acceptance Criteria:**
- Upload rejected when limit reached.
- Error message clear.

---

### Task 5.6: Ownership Verification Helper
**ID:** TASK-003-27
**Priority:** High
**Dependencies:** TASK-003-23
**Estimate:** 15 minutes

**Description:**
Create a helper to verify document ownership.

**Steps:**
1. Add private method `verifyOwnership(userId: string, documentId: string)`.
2. Query document and check `userId` matches.
3. Throw `ForbiddenException` if not owner.
4. Use in all document operations.

**Acceptance Criteria:**
- All document operations verify ownership.
- 403 returned for unauthorized access.

---

## 7. Phase 6: Testing & Documentation

### Task 6.1: Write Unit Tests for ProfileService
**ID:** TASK-003-28
**Priority:** High
**Dependencies:** TASK-003-06, TASK-003-07, TASK-003-08, TASK-003-13
**Estimate:** 1 hour

**Description:**
Write unit tests for ProfileService.

**Steps:**
1. Create `src/modules/profile/services/profile.service.spec.ts`.
2. Mock `PrismaService`.
3. Test `getProfile`: returns profile data.
4. Test `updateProfile`: updates fields, handles arrays.
5. Test `calculateCompletionPct`: all scenarios.
6. Test `isCoreFieldsComplete`: all scenarios.
7. Test `calculateLastCompletedStep`: all scenarios.

**Acceptance Criteria:**
- ≥80% coverage.
- All test cases pass.

---

### Task 6.2: Write Unit Tests for DocumentsService
**ID:** TASK-003-29
**Priority:** High
**Dependencies:** TASK-003-23
**Estimate:** 45 minutes

**Description:**
Write unit tests for DocumentsService.

**Steps:**
1. Create `src/modules/profile/services/documents.service.spec.ts`.
2. Mock `PrismaService` and `StorageService`.
3. Test `uploadDocument`: success, validation failures, size limit.
4. Test `getDownloadUrl`: ownership check, signed URL generation.
5. Test `deleteDocument`: ownership check, file deletion.

**Acceptance Criteria:**
- ≥80% coverage.
- All test cases pass.

---

### Task 6.3: Write E2E Tests
**ID:** TASK-003-30
**Priority:** High
**Dependencies:** TASK-003-10, TASK-003-11, TASK-003-25
**Estimate:** 1 hour

**Description:**
Write E2E tests for profile endpoints.

**Steps:**
1. Create `test/profile.e2e-spec.ts`.
2. Test `GET /profile`: authenticated, unauthenticated.
3. Test `PATCH /profile`: update fields, validation errors, clearing required fields.
4. Test `POST /profile/documents`: upload valid/invalid files.
5. Test `GET /profile/documents/:id/download`: ownership, signed URL.
6. Test `DELETE /profile/documents/:id`: success, unauthorized.
7. Test `GET /reference/*`: public access.

**Acceptance Criteria:**
- All tests pass.
- Database state verified after tests.
- Test database used (no side effects).

---

### Task 6.4: Add Swagger Documentation
**ID:** TASK-003-31
**Priority:** High
**Dependencies:** TASK-003-10, TASK-003-11, TASK-003-25, TASK-003-05
**Estimate:** 30 minutes

**Description:**
Add Swagger/OpenAPI documentation to all profile endpoints.

**Steps:**
1. Add `@ApiTags('profile')` to controllers.
2. Add `@ApiOperation` with summaries.
3. Add `@ApiResponse` for 200, 201, 400, 401, 403, 404, 500.
4. Add `@ApiBody` for request DTOs.
5. Add `@ApiParam` for ID parameters.
6. Ensure DTOs have `@ApiProperty` decorators.

**Acceptance Criteria:**
- Swagger UI at `/api` shows all profile endpoints.
- All responses documented with examples.
- DTOs show all fields.

---

### Task 6.5: Run Quality Gates
**ID:** TASK-003-32
**Priority:** High
**Dependencies:** All previous tasks
**Estimate:** 15 minutes

**Description:**
Run all quality checks and fix any issues.

**Steps:**
1. Run `pnpm lint` and fix errors.
2. Run `pnpm test` and ensure all tests pass.
3. Run `pnpm build` and ensure build succeeds.
4. Verify Swagger UI locally.
5. Verify all endpoints manually using Postman or curl.

**Acceptance Criteria:**
- All quality gates pass.
- `pnpm lint` passes with no errors.
- `pnpm test` passes with ≥80% coverage.
- `pnpm build` completes successfully.
- All endpoints functional.

---

## 8. Task Dependencies Graph

```
TASK-003-01 ─┬─ TASK-003-02 ─┬─ TASK-003-03 ─┬─ TASK-003-05 (Reference Service)
             │                │               │
             │                │               └─ TASK-003-04 (Module Scaffold) ─┬─ TASK-003-06 (ProfileService)
             │                │                                                 │
             │                └─ TASK-003-07 (Core Fields)                     │
             │                                                                 │
             │                                                                 ├─ TASK-003-08 (Completion %)
             │                                                                 │
             │                                                                 ├─ TASK-003-09 (Last Step)
             │                                                                 │
             │                                                                 ├─ TASK-003-10 (GET /profile)
             │                                                                 │
             │                                                                 ├─ TASK-003-11 (PATCH /profile)
             │                                                                 │   │
             │                                                                 │   └─ TASK-003-12 (UpdateProfileDto)
             │                                                                 │
             │                                                                 └─ TASK-003-13 (Multi-Value)
             │
             ├─ TASK-003-14 (GPA Util) ─┬─ TASK-003-15 (GPA Tests)
             │                         │
             │                         └─ TASK-003-16 (GPA Integration) ─┬─ TASK-003-17 (GPA Response)
             │                                                          │
             └─ TASK-003-18 (Storage Interface) ─┬─ TASK-003-19 (Local) ─┐
                                                 │                      │
                                                 ├─ TASK-003-20 (S3) ───┤
                                                 │                      │
                                                 └─ TASK-003-21 (Factory) ─┬─ TASK-003-22 (Encryption) ─┬─ TASK-003-23 (DocumentsService)
                                                                           │                              │
                                                                           │                              ├─ TASK-003-24 (Multer)
                                                                           │                              │
                                                                           │                              ├─ TASK-003-25 (DocumentsController)
                                                                           │                              │
                                                                           │                              ├─ TASK-003-26 (Count Limit)
                                                                           │                              │
                                                                           │                              └─ TASK-003-27 (Ownership)
                                                                           │
                                                                           ├─ TASK-003-28 (ProfileService Tests)
                                                                           ├─ TASK-003-29 (DocumentsService Tests)
                                                                           ├─ TASK-003-30 (E2E Tests)
                                                                           ├─ TASK-003-31 (Swagger)
                                                                           └─ TASK-003-32 (Quality Gates)
```

---

## 9. Validation Checklist

After completing all tasks, verify:

- [ ] `pnpm lint` passes with no errors.
- [ ] `pnpm test` passes with ≥80% coverage.
- [ ] `pnpm build` completes successfully.
- [ ] Reference tables exist with seed data.
- [ ] `GET /profile` returns full profile with calculated fields.
- [ ] `PATCH /profile` updates fields with validation.
- [ ] Core fields cannot be cleared once set.
- [ ] Completion percentage calculated correctly.
- [ ] GPA normalization works for all scales.
- [ ] Document upload validates MIME via signature.
- [ ] Documents encrypted and stored outside web root.
- [ ] Signed URLs generated with 5-minute expiration.
- [ ] Document ownership enforced on all operations.
- [ ] Swagger UI shows all endpoints.
- [ ] E2E tests all pass.

---

## 10. Notes

- All commands assume `pnpm` as the package manager.
- This module should NOT modify any other module (Auth, Users, etc.) unless explicitly requested.
- The storage provider must be configurable; `local` is the default for development.
- File encryption key must be 64 hex characters.
- All code must follow the project's coding standards and AGENTS.md guidelines.
- Security considerations from spec.md must be strictly followed.
- RLS policies are already in the database schema; ensure application-level ownership checks complement them.

---

## 11. References

- [Feature Specification: Profile Module](./spec.md)
- [Implementation Plan: Profile Module](./plan.md)
- [Sprint 2 — Final API Contract](../Sprint2_APIs.md)
- [Levora Database Design v1.2](../database/Levora_Database_Design_v1.2_MVP.md)
- [AGENTS.md](../AGENTS.md)
