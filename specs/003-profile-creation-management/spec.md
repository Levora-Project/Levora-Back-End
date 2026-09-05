# Feature Specification: Profile Creation & Management (Backend)

**Feature ID:** 003
**Feature Name:** Profile Creation & Management
**Sprint:** 2
**Status:** Draft
**Created:** 2026-08-30
**Updated:** 2026-08-30

---

## 1. Feature Overview

### 1.1 Description

This feature implements the backend services for user profile creation and management, enabling the multi-step onboarding wizard (Screens 1–4) and post-onboarding profile editing. It provides RESTful APIs for profile CRUD operations, document upload/download/delete, GPA normalization, and reference data endpoints for fields of study and skills taxonomy.

This module serves as the foundation for the Discovery & Matching engine (Sprint 3) by ensuring all user profile data is properly structured, validated, and accessible.

### 1.2 Goals

- Provide complete profile CRUD operations with partial updates per wizard step.
- Implement secure document upload with encryption at rest and read-only signed URLs for download.
- Normalize GPA from multiple scales (4.0, percentage, letter grade) to 4.0-scale equivalent.
- Calculate profile completion percentage and track core fields completion status.
- Serve reference data (fields of study, skills taxonomy) from database with seed data.
- Ensure all operations respect user isolation (users can only access their own data).

### 1.3 Out of Scope

- Matching engine (Sprint 3).
- Scraping pipeline integration (Track B).
- Admin approval workflows.
- Email verification or password reset.
- Frontend UI implementation (covered by frontend team).

---

## 2. User Stories

| ID        | User Story                                                                                                                                                                        | Priority  | Related FR     |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | -------------- |
| US-003-01 | As a user, I want to retrieve my complete profile with calculated fields (completion %, normalized GPA, core fields status) so that the frontend can render the wizard correctly. | Must-Have | FR-2.1, FR-2.5 |
| US-003-02 | As a user, I want to update my profile partially (one wizard step at a time) so that my progress is saved incrementally.                                                          | Must-Have | FR-2.1         |
| US-003-03 | As a user, I want validation to ensure core fields (education level, field of study, nationality) are complete before onboarding is marked complete.                              | Must-Have | FR-2.2         |
| US-003-04 | As a user, I want to upload documents securely with proper validation (size, type, count) so that my files are stored safely.                                                     | Must-Have | FR-2.4         |
| US-003-05 | As a user, I want to download my documents via read-only temporary links so that I can preview them securely.                                                                     | Must-Have | FR-2.4         |
| US-003-06 | As a user, I want to delete documents I no longer need so that I can manage my document library.                                                                                  | Must-Have | FR-2.4         |
| US-003-07 | As a user, I want to enter GPA using any scale (4.0, percentage, letter) so that I don't have to manually convert it.                                                             | Must-Have | FR-2.6         |
| US-003-08 | As a user, I want to select multiple fields of study and skills so that my profile reflects my full academic and professional range.                                              | Must-Have | FR-2.7, FR-2.8 |
| US-003-09 | As a user, I want to edit any profile field after onboarding so that I can keep my information up to date.                                                                        | Must-Have | FR-2.9         |
| US-003-10 | As a developer, I want comprehensive test coverage and API documentation so that I can ensure reliability and integrate efficiently.                                              | Must-Have | Implicit       |

---

## 3. Functional Requirements

### 3.1 Profile Management

| ID        | Requirement                                                                                                                                                                   | Priority    |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| FR-003-01 | The system shall provide `GET /profile` returning the full user profile with calculated fields: `completionPct`, `coreFieldsComplete`, `lastCompletedStep`, `gpaNormalized4`. | Must-Have   |
| FR-003-02 | The system shall auto-create an empty profile (`isDraft: true`) upon user registration.                                                                                       | Must-Have   |
| FR-003-03 | The system shall provide `PATCH /profile` accepting partial updates with validation per field.                                                                                | Must-Have   |
| FR-003-04 | The system shall treat `educationLevel`, `fieldOfStudy` (at least one), and `nationality` as required fields.                                                                 | Must-Have   |
| FR-003-05 | The system shall reject clearing a required field to `null` once it has been set.                                                                                             | Must-Have   |
| FR-003-06 | The system shall calculate `completionPct` as a weighted score from a fixed field list.                                                                                       | Must-Have   |
| FR-003-07 | The system shall track `lastCompletedStep` (1–4) based on the highest step with completed data.                                                                               | Should-Have |

### 3.2 Document Management

| ID        | Requirement                                                                                                    | Priority  |
| --------- | -------------------------------------------------------------------------------------------------------------- | --------- |
| FR-003-08 | The system shall provide `POST /profile/documents` accepting multipart/form-data with `docType`.          | Must-Have |
| FR-003-09 | The system shall validate file size (max 5MB), MIME type (PDF, DOC, DOCX, PNG, JPG), and extension (same set). | Must-Have |
| FR-003-10 | The system shall validate MIME type using file signature (magic bytes) not just extension.                     | Must-Have |
| FR-003-11 | The system shall enforce a soft cap of 20 documents per user.                                                  | Must-Have |
| FR-003-12 | The system shall encrypt file content at rest using AES-256-CBC before storage.                                | Must-Have |
| FR-003-13 | The system shall store documents outside the web root and rename files to UUID.                                | Must-Have |
| FR-003-14 | The system shall provide `GET /profile/documents/:id/download` returning a short-lived read-only signed URL.   | Must-Have |
| FR-003-15 | The system shall provide `DELETE /profile/documents/:id` removing both the database record and physical file.  | Must-Have |
| FR-003-16 | The system shall verify document ownership before allowing download or deletion.                               | Must-Have |

### 3.3 GPA Normalization

| ID        | Requirement                                                                                       | Priority  |
| --------- | ------------------------------------------------------------------------------------------------- | --------- |
| FR-003-17 | The system shall accept GPA input with a scale indicator: `'4.0'`, `'percentage'`, or `'letter'`. | Must-Have |
| FR-003-18 | The system shall validate range: 0.0–4.0 for 4.0 scale, 0–100 for percentage, A+–F for letter.    | Must-Have |
| FR-003-19 | The system shall normalize input to 4.0-scale equivalent using a deterministic mapping.           | Must-Have |
| FR-003-20 | Changing scale shall clear the existing GPA value (no automatic conversion).                      | Must-Have |

### 3.4 Multi-Value Fields

| ID        | Requirement                                                                                                     | Priority  |
| --------- | --------------------------------------------------------------------------------------------------------------- | --------- |
| FR-003-21 | The system shall support `fieldOfStudy` as an array with max 5 values.                                          | Must-Have |
| FR-003-22 | The system shall support `skills` as an array of objects `{ skillId, proficiency }` with max 20 skills.         | Must-Have |
| FR-003-23 | The system shall support `languages` as an array of objects `{ languageId, proficiency }` with max 5 languages. | Must-Have |
| FR-003-24 | The system shall replace the entire array on update (no incremental merge).                                     | Must-Have |

### 3.5 Reference Data

| ID        | Requirement                                                                                                      | Priority  |
| --------- | ---------------------------------------------------------------------------------------------------------------- | --------- |
| FR-003-25 | The system shall provide `GET /reference/fields-of-study` returning a list of valid fields from database.        | Must-Have |
| FR-003-26 | The system shall provide `GET /reference/skills-taxonomy` returning categories with nested skills from database. | Must-Have |
| FR-003-27 | The system shall seed initial fields of study and skills taxonomy data.                                          | Must-Have |

---

## 4. Non-Functional Requirements

| ID         | Requirement                                             | Target                     |
| ---------- | ------------------------------------------------------- | -------------------------- |
| NFR-003-01 | `GET /profile` response time                            | < 200ms                    |
| NFR-003-02 | `PATCH /profile` response time                          | < 300ms                    |
| NFR-003-03 | Document upload response time (excluding file transfer) | < 500ms                    |
| NFR-003-04 | Document download signed URL generation                 | < 100ms                    |
| NFR-003-05 | GPA normalization function                              | < 1ms per call             |
| NFR-003-06 | Unit test coverage for ProfileService                   | ≥ 80%                      |
| NFR-003-07 | Unit test coverage for GPA utility                      | 100%                       |
| NFR-003-08 | File encryption                                         | AES-256-CBC                |
| NFR-003-09 | Signed URL expiration                                   | 5 minutes                  |
| NFR-003-10 | Maximum concurrent uploads per user                     | 3–4 (enforced by frontend) |

---

## 5. Acceptance Criteria

### 5.1 Profile CRUD

| ID        | Criterion                                                                                                   |
| --------- | ----------------------------------------------------------------------------------------------------------- |
| AC-003-01 | `GET /profile` returns 200 with full profile data for authenticated user.                                   |
| AC-003-02 | `GET /profile` never returns 404 (profile auto-created).                                                    |
| AC-003-03 | `PATCH /profile` with valid fields updates only those fields.                                               |
| AC-003-04 | `PATCH /profile` with invalid data returns 400 with descriptive error.                                      |
| AC-003-05 | `PATCH /profile` clearing a required field returns 400.                                                     |
| AC-003-06 | `coreFieldsComplete` is `true` only when educationLevel, fieldOfStudy (non-empty), and nationality are set. |

### 5.2 Documents

| ID        | Criterion                                                                           |
| --------- | ----------------------------------------------------------------------------------- |
| AC-003-07 | `POST /profile/documents` with a valid PDF file returns 201 with document metadata. |
| AC-003-08 | `POST /profile/documents` with a 6MB file returns 413 or 400.                       |
| AC-003-09 | `POST /profile/documents` with a renamed .exe file returns 400 (MIME validation).   |
| AC-003-10 | Stored file is encrypted and renamed to UUID.                                       |
| AC-003-11 | `GET /profile/documents/:id/download` returns a signed URL valid for 5 minutes.     |
| AC-003-12 | `GET /profile/documents/:id/download` for another user's document returns 403.      |
| AC-003-13 | `DELETE /profile/documents/:id` removes record and physical file.                   |

### 5.3 GPA Normalization

| ID        | Criterion                                           |
| --------- | --------------------------------------------------- |
| AC-003-14 | GPA 3.5 on 4.0 scale normalizes to 3.5.             |
| AC-003-15 | GPA 85% normalizes to 3.4 (using standard mapping). |
| AC-003-16 | GPA 'A' normalizes to 4.0.                          |
| AC-003-17 | GPA 4.5 on 4.0 scale returns 400 validation error.  |
| AC-003-18 | Changing scale clears the existing GPA value.       |

### 5.4 Multi-Value Fields

| AC-003-19 | `fieldOfStudy` accepts up to 5 values; 6th returns 400. |
| AC-003-20 | `skills` accepts up to 20 skills; 21st returns 400. |
| AC-003-21 | `languages` accepts up to 5 languages; 6th returns 400. |
| AC-003-22 | Update replaces entire array (no orphan records). |

### 5.5 Reference Data

| AC-003-23 | `GET /reference/fields-of-study` returns seeded list. |
| AC-003-24 | `GET /reference/skills-taxonomy` returns categories with nested skills. |
| AC-003-25 | Both endpoints return 200 and are publicly accessible (no auth required). |

---

## 6. Dependencies

### 6.1 External Dependencies

| Dependency                      | Version | Purpose                                 |
| ------------------------------- | ------- | --------------------------------------- |
| `@nestjs/config`                | ^3.0.0  | Configuration management                |
| `@nestjs/platform-express`      | ^10.0.0 | Multipart file handling                 |
| `multer`                        | ^1.4.5  | File upload middleware                  |
| `file-type`                     | ^18.0.0 | MIME type detection from file signature |
| `uuid`                          | ^9.0.0  | Generate unique file names              |
| `@aws-sdk/client-s3`            | ^3.0.0  | S3 storage (optional)                   |
| `@aws-sdk/s3-request-presigner` | ^3.0.0  | Signed URLs for S3                      |
| `bcrypt`                        | ^5.0.0  | Existing (password hashing)             |

### 6.2 Internal Dependencies

| Dependency             | Description                                                                                                                   |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Feature 001 (JWT Auth) | Authentication system; `@Public()` decorator for reference endpoints.                                                         |
| Prisma Schema          | `UserProfiles`, `UserEducations`, `UserSkills`, `UserLanguages`, `Documents`, `SkillsMaster`, `LanguagesMaster` models exist. |
| Seed Script            | Initial reference data (fields of study, skills) must be seeded.                                                              |

---

## 7. Risks and Mitigations

| Risk                                     | Impact | Mitigation                                                                               |
| ---------------------------------------- | ------ | ---------------------------------------------------------------------------------------- |
| Malicious file upload (code injection)   | High   | Validate MIME via file signature; store outside web root; rename files; encrypt content. |
| Large file uploads causing memory issues | Medium | Use streaming upload (multer with disk storage); enforce 5MB limit.                      |
| Signed URL leakage                       | Medium | Short expiration (5 min); require auth to generate; URL only grants read access.         |
| GPA normalization mapping ambiguity      | Medium | Use well-documented mapping table; test with all edge cases (letter grades with +/-).    |
| Concurrent profile updates               | Low    | Use database transactions; handle race conditions with Prisma.                           |
| Storage provider misconfiguration        | High   | Validate configuration at startup; fail fast with clear error.                           |

---

## 8. Technical Notes

### 8.1 Profile Auto-Creation

When a user registers (via `AuthService.register`), a `UserProfiles` record MUST be created automatically:

- `userId`: the new user's ID
- `isDraft`: `true`
- `completionPct`: `0`
- `matchingVersion`: `1` (triggers will handle increment)

### 8.2 GPA Normalization Mapping

| Letter Grade | 4.0 Scale | Percentage Range |
| ------------ | --------- | ---------------- |
| A+           | 4.0       | 97–100           |
| A            | 4.0       | 93–96            |
| A-           | 3.7       | 90–92            |
| B+           | 3.3       | 87–89            |
| B            | 3.0       | 83–86            |
| B-           | 2.7       | 80–82            |
| C+           | 2.3       | 77–79            |
| C            | 2.0       | 73–76            |
| C-           | 1.7       | 70–72            |
| D+           | 1.3       | 67–69            |
| D            | 1.0       | 60–66            |
| F            | 0.0       | < 60             |

### 8.3 Profile Completion Percentage Calculation

| Field              | Weight | Notes                         |
| ------------------ | ------ | ----------------------------- |
| `educationLevel`   | 15%    | Required field                |
| `fieldOfStudy`     | 15%    | Required field (at least one) |
| `nationality`      | 15%    | Required field                |
| `dateOfBirth`      | 5%     | Optional                      |
| `currentCountry`   | 5%     | Optional                      |
| `currentCity`      | 5%     | Optional                      |
| `phone`            | 5%     | Optional                      |
| `experienceLevel`  | 5%     | Optional                      |
| `hasFinancialNeed` | 5%     | Optional                      |
| `careerGoals`      | 5%     | Optional (if > 20 chars)      |
| `skills`           | 10%    | At least one skill            |
| `languages`        | 5%     | At least one language         |
| `profilePhotoUrl`  | 5%     | Optional                      |

### 8.4 Storage Service Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      StorageService (Interface)                │
├─────────────────────────────────────────────────────────────────┤
│  + upload(file: Buffer, filename: string): Promise<string>    │
│  + download(key: string): Promise<Buffer>                     │
│  + delete(key: string): Promise<void>                         │
│  + getSignedUrl(key: string, expiresIn: number): Promise<string> │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────┴───────┐     ┌───────┴───────┐     ┌───────┴───────┐
│    S3Storage  │     │  LocalStorage │     │  Future: GCS  │
│   (AWS SDK)   │     │   (fs module) │     │               │
└───────────────┘     └───────────────┘     └───────────────┘
```

### 8.5 Environment Variables

| Variable              | Required | Description               |
| --------------------- | -------- | ------------------------- |
| `STORAGE_PROVIDER`    | Yes      | `'s3'` or `'local'`       |
| `S3_REGION`           | If S3    | AWS region                |
| `S3_BUCKET`           | If S3    | Bucket name               |
| `S3_ACCESS_KEY`       | If S3    | AWS access key            |
| `S3_SECRET_KEY`       | If S3    | AWS secret key            |
| `S3_ENDPOINT`         | No       | Custom endpoint (MinIO)   |
| `LOCAL_UPLOAD_PATH`   | If local | `./uploads` (default)     |
| `FILE_ENCRYPTION_KEY` | Yes      | 64-char hex key (AES-256) |

---

## 9. References

- [Levora Database Design v1.2](../database/Levora_Database_Design_v1.2_MVP.md)
- [System Architecture Design v2.0](../architecture/System_Architecture_Design.md)
- [SRS v1.0 Section 3.2](../requirements/Levora_SRS.md#32-profile-creation--management)
- [Sprint 2 — Final API Contract](../Sprint2_APIs.md)
- [Feature 001: Project Setup & JWT Auth](./001-project-setup-jwt-auth/spec.md)
