# Project Settings and Environment Variables Management Analysis

## 1. Overview
The project manages its environment variables using a combination of environment files and the NestJS `@nestjs/config` package. Configurations are centrally defined in the `src/config/` directory where they are strictly validated and typed using **Zod** schemas (e.g., `app.config.ts`, `security.config.ts`, `database.config.ts`, etc.). The `ConfigModule` loads these variables globally when the application starts in `src/app.module.ts`.

## 2. Examination of Settings Management
- **Configuration Files (`src/config/*.config.ts`)**: The project defines schemas using `zod`. These schemas extract variables from `process.env`, applying types, default values, and validation rules.
- **NestJS `ConfigModule`**: Loaded in `src/app.module.ts`, it points to `envFilePath: ['.env']` to initialize the configuration structures.
- **Environment Files**: The root folder contains `.env`, `.env.example`, and `.env.local`. Git ignores `.env` and `.env.local` to prevent committing secrets to version control, which is standard practice.

## 3. Configuration Issues Identified

The analysis revealed several issues that circumvent the established configuration management system, contradicting the strict project rules outlined in `AGENTS.md` (which mandate the exclusive use of `ConfigModule` for accessing secrets).

### Issue 1: Direct `process.env` Access Outside Configuration Files
Despite utilizing `ConfigModule` and `ConfigService`, several services and guards access `process.env` directly. This bypasses the validation, transformation, and type safety provided by `Zod`.
- **`src/prisma/prisma.service.ts`**: Uses `process.env.NODE_ENV === 'development'` instead of `ConfigService`.
- **`src/modules/auth/guards/csrf-origin.guard.ts`**: Uses `process.env.NODE_ENV !== 'production'` instead of `ConfigService`.
- **`src/modules/auth/config/providers.config.ts`**: Directly accesses `process.env.GOOGLE_CLIENT_ID`, `process.env.LINKEDIN_CLIENT_ID`, and others to build the OAuth providers configuration.

### Issue 2: Bypassing NestJS Dependency Injection (DI) Lifecycle
The file `src/modules/auth/config/providers.config.ts` constructs provider configurations using raw `process.env` values without relying on the `ConfigService`.
- Functions like `getConfiguredProviders()` are called during the static initialization of `src/modules/auth/auth.module.ts`. This occurs *before* `ConfigModule` has fully instantiated and validated the variables.
- This creates duplicated parsing logic since `oauth.config.ts` already defines and validates these OAuth keys.

### Issue 3: `.env.local` is Ignored by `ConfigModule`
Although an `.env.local` file exists in the repository, the `ConfigModule` in `src/app.module.ts` is strictly configured to read only from `.env`:
```typescript
envFilePath: ['.env'],
```
To better support local developer workflows (where `.env.local` overrides `.env` for user-specific settings), this should be updated to accept multiple files in priority order:
```typescript
envFilePath: ['.env.local', '.env'],
```

### Issue 4: Redundant Fallbacks Undermining Zod Validation
Several modules and services define their own fallback values for environment variables, duplicating the default values already enforced by `Zod` in `src/config/*.config.ts`.
- **`src/modules/auth/auth.module.ts`**:
  ```typescript
  secret: config.get<string>('security.JWT_SECRET') || config.get<string>('JWT_SECRET') || 'dev-only-secret-do-not-use-in-production!!'
  ```
  This is redundant as `security.config.ts` already securely enforces this exact default.
- **`src/modules/auth/services/encryption.service.ts`**:
  ```typescript
  const rawKey = this.config.get<string>('oauth.OAUTH_ENCRYPTION_KEY') || this.config.get<string>('OAUTH_ENCRYPTION_KEY') || process.env.OAUTH_ENCRYPTION_KEY;
  ```
  This duplicates the validation and unnecessarily falls back to `process.env`. It should just rely on `this.config.get<string>('oauth.OAUTH_ENCRYPTION_KEY')`.

## 4. Recommendations for Improvement
1. **Refactor Direct `process.env` Usage**: Replace all direct instances of `process.env` in services, guards, and modules with proper `ConfigService` injections.
2. **Refactor OAuth Providers Registration**: Integrate `providers.config.ts` into the NestJS DI container so it securely accesses the validated values from `ConfigService`, or rely solely on `oauth.config.ts`.
3. **Remove Redundant Fallbacks**: Trust the robust Zod validation schemas in `src/config/`. Remove inline fallback chains in `AuthModule` and `EncryptionService`.
4. **Support `.env.local`**: Update `app.module.ts` `ConfigModule.forRoot` to load `['.env.local', '.env']` to correctly support local developer environment variable overriding.
