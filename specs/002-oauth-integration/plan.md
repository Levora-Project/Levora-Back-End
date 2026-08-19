
```markdown
# Implementation Plan: OAuth Integration (Google + LinkedIn)

**Feature ID:** 002
**Feature Name:** OAuth Integration (Google + LinkedIn)
**Sprint:** 1
**Status:** Draft
**Created:** 2026-08-19
**Updated:** 2026-08-19

---

## 1. Technical Context

### 1.1 Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Backend Framework | NestJS | ^10.0.0 |
| Authentication | Passport.js | ^0.6.0 |
| OAuth Strategies | passport-google-oauth20, passport-linkedin-oauth2 | ^2.0.0 |
| Database ORM | Prisma | ^5.0.0 |
| Database | PostgreSQL | 15+ |
| Encryption | Crypto (Node.js built-in) | - |

### 1.2 Architecture Patterns

| Pattern | Description |
|---------|-------------|
| Strategy Pattern | OAuth strategies for different providers |
| Dependency Injection | NestJS DI for service composition |
| Repository Pattern | Prisma for data access |
| Factory Pattern | User creation from OAuth profile data |

---

## 2. Architecture Overview

### 2.1 Module Structure (Additions to Auth Module)

```
src/modules/auth/
├── strategies/
│   ├── google.strategy.ts        # Google OAuth strategy
│   └── linkedin.strategy.ts      # LinkedIn OAuth strategy
├── services/
│   ├── auth.service.ts           # Extended with OAuth methods
│   └── oauth.service.ts          # NEW: OAuth-specific service
├── controllers/
│   └── auth.controller.ts        # Extended with OAuth endpoints
├── dto/
│   └── oauth-callback.dto.ts     # NEW: OAuth callback DTO
└── interfaces/
    └── oauth-profile.interface.ts # NEW: OAuth profile interface
```

### 2.2 OAuth Flow Diagram

```
┌─────────┐         ┌─────────────┐         ┌─────────────┐
│  Client │         │   NestJS    │         │   OAuth     │
│         │         │   Backend   │         │  Provider   │
└────┬────┘         └──────┬──────┘         └──────┬──────┘
     │                     │                       │
     │ GET /auth/google    │                       │
     ├────────────────────>│                       │
     │                     │                       │
     │                     │ Redirect to Provider  │
     │                     ├──────────────────────>│
     │                     │                       │
     │                     │                       │
     │                     │ Provider redirects to │
     │                     │ callback URL          │
     │                     │<──────────────────────┤
     │                     │                       │
     │                     │ Verify OAuth code     │
     │                     │ and get profile       │
     │                     ├──────────────────────>│
     │                     │                       │
     │                     │ Profile + Tokens      │
     │                     │<──────────────────────┤
     │                     │                       │
     │                     │ Find or Create User   │
     │                     │ Store OAuth Identity  │
     │                     │ Generate JWT          │
     │                     │                       │
     │ Redirect with JWT   │                       │
     │<────────────────────┤                       │
     │                     │                       │
```

---

## 3. Implementation Strategy

### 3.1 Phase 1: Dependency Setup & Configuration

**Goal:** Install required packages and configure OAuth settings.

**Tasks:**
1. Install `@nestjs/passport`, `passport-google-oauth20`, `passport-linkedin-oauth2`
2. Add type definitions for OAuth packages
3. Update environment configuration
4. Create `.env.example` entries for OAuth

### 3.2 Phase 2: Google OAuth Integration

**Goal:** Implement Google OAuth strategy and endpoints.

**Tasks:**
1. Create Google strategy
2. Implement Google OAuth controller endpoints
3. Handle Google profile data processing
4. Create or find user from Google profile

### 3.3 Phase 3: LinkedIn OAuth Integration

**Goal:** Implement LinkedIn OAuth strategy and endpoints.

**Tasks:**
1. Create LinkedIn strategy
2. Implement LinkedIn OAuth controller endpoints
3. Handle LinkedIn profile data processing
4. Create or find user from LinkedIn profile

### 3.4 Phase 4: User Management & Token Storage

**Goal:** Implement OAuth user management and secure token storage.

**Tasks:**
1. Extend UsersService for OAuth user creation
2. Implement OAuth identity storage with encryption
3. Handle account linking for existing users
4. Implement proper error handling

### 3.5 Phase 5: Testing

**Goal:** Ensure OAuth flows work correctly.

**Tasks:**
1. Write unit tests for OAuth strategies
2. Write unit tests for OAuth service
3. Write E2E tests for OAuth flows

---

## 4. API Design

### 4.1 Google OAuth Initiation

```
GET /auth/google

Description: Initiates Google OAuth flow
Redirects: Google OAuth consent screen
Scopes: profile, email
```

### 4.2 Google OAuth Callback

```
GET /auth/google/callback?code={code}

Description: Handles Google OAuth callback
Success: Redirects to frontend with JWT tokens
Failure: Redirects to error page or returns error response
```

### 4.3 LinkedIn OAuth Initiation

```
GET /auth/linkedin

Description: Initiates LinkedIn OAuth flow
Redirects: LinkedIn OAuth consent screen
Scopes: profile, email
```

### 4.4 LinkedIn OAuth Callback

```
GET /auth/linkedin/callback?code={code}

Description: Handles LinkedIn OAuth callback
Success: Redirects to frontend with JWT tokens
Failure: Redirects to error page or returns error response
```

---

## 5. OAuth Strategy Implementation

### 5.1 Google Strategy

```typescript
// src/modules/auth/strategies/google.strategy.ts

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../services/auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('google.clientId'),
      clientSecret: configService.get<string>('google.clientSecret'),
      callbackURL: configService.get<string>('google.callbackUrl'),
      scope: ['profile', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const user = await this.authService.handleOAuthLogin({
        provider: 'google',
        providerUserId: profile.id,
        email: profile.emails?.[0]?.value,
        firstName: profile.name?.givenName,
        lastName: profile.name?.familyName,
        accessToken,
        refreshToken,
      });
      
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
}
```

### 5.2 LinkedIn Strategy

```typescript
// src/modules/auth/strategies/linkedin.strategy.ts

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-linkedin-oauth2';
import { AuthService } from '../services/auth.service';

@Injectable()
export class LinkedInStrategy extends PassportStrategy(Strategy, 'linkedin') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('linkedin.clientId'),
      clientSecret: configService.get<string>('linkedin.clientSecret'),
      callbackURL: configService.get<string>('linkedin.callbackUrl'),
      scope: ['profile', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const user = await this.authService.handleOAuthLogin({
        provider: 'linkedin',
        providerUserId: profile.id,
        email: profile.emails?.[0]?.value,
        firstName: profile.name?.givenName,
        lastName: profile.name?.familyName,
        accessToken,
        refreshToken,
      });
      
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
}
```

---

## 6. OAuth Service Implementation

```typescript
// src/modules/auth/services/oauth.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

interface OAuthLoginData {
  provider: string;
  providerUserId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  accessToken: string;
  refreshToken?: string;
}

@Injectable()
export class OAuthService {
  constructor(private readonly prisma: PrismaService) {}

  async handleOAuthLogin(data: OAuthLoginData) {
    const { provider, providerUserId, email, firstName, lastName, accessToken, refreshToken } = data;

    // Encrypt tokens
    const encryptedAccessToken = this.encryptToken(accessToken);
    const encryptedRefreshToken = refreshToken ? this.encryptToken(refreshToken) : null;

    // Check if OAuth identity exists
    let identity = await this.prisma.oauthIdentities.findUnique({
      where: { provider_providerUserId: { provider, providerUserId } },
      include: { user: true },
    });

    if (identity) {
      // Update tokens
      identity = await this.prisma.oauthIdentities.update({
        where: { id: identity.id },
        data: {
          accessTokenRef: encryptedAccessToken,
          refreshTokenRef: encryptedRefreshToken,
          updatedAt: new Date(),
        },
        include: { user: true },
      });
      return identity.user;
    }

    // Check if user exists with this email
    let user = await this.prisma.users.findUnique({
      where: { email },
    });

    if (user) {
      // Link OAuth identity to existing user
      await this.prisma.oauthIdentities.create({
        data: {
          userId: user.id,
          provider,
          providerUserId,
          accessTokenRef: encryptedAccessToken,
          refreshTokenRef: encryptedRefreshToken,
          linkedAt: new Date(),
        },
      });
      return user;
    }

    // Create new user
    user = await this.prisma.users.create({
      data: {
        email,
        firstName,
        lastName,
        isEmailVerified: true,
        isActive: true,
        userProfile: {
          create: {
            fullName: `${firstName} ${lastName}`.trim(),
            isDraft: false,
          },
        },
        oauthIdentities: {
          create: {
            provider,
            providerUserId,
            accessTokenRef: encryptedAccessToken,
            refreshTokenRef: encryptedRefreshToken,
            linkedAt: new Date(),
          },
        },
      },
    });

    // Assign default 'user' role
    const userRole = await this.prisma.roles.findUnique({
      where: { name: 'user' },
    });

    if (userRole) {
      await this.prisma.userRoles.create({
        data: {
          userId: user.id,
          roleId: userRole.id,
        },
      });
    }

    return user;
  }

  private encryptToken(token: string): string {
    const key = process.env.OAUTH_ENCRYPTION_KEY || 'default-key-change-in-production';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
    let encrypted = cipher.update(token);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }

  private decryptToken(encryptedToken: string): string {
    const parts = encryptedToken.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = Buffer.from(parts[1], 'hex');
    const key = process.env.OAUTH_ENCRYPTION_KEY || 'default-key-change-in-production';
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
}
```

---

## 7. Database Schema Updates

### 7.1 OauthIdentities Table (Already Added in Feature 001)

The `OauthIdentities` model is already defined in the schema. Verification:

```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_name = 'oauth_identities'
);
```

### 7.2 Encrypted Token Storage

```typescript
// Token encryption format
// <iv>:<encrypted-token>
// iv: 32 character hex string (16 bytes)
// encrypted-token: hex string of encrypted data
```

---

## 8. Testing Plan

### 8.1 Unit Tests

| Test Suite | Target | Coverage Goal |
|------------|--------|---------------|
| GoogleStrategy | validate method | ≥ 80% |
| LinkedInStrategy | validate method | ≥ 80% |
| OAuthService | handleOAuthLogin | ≥ 80% |

### 8.2 E2E Tests

| Test Suite | Endpoints to Test |
|------------|-------------------|
| Google OAuth Flow | GET /auth/google → redirect → callback |
| LinkedIn OAuth Flow | GET /auth/linkedin → redirect → callback |
| OAuth Error Handling | Invalid tokens, missing data |

---

## 9. Configuration

### 9.1 Environment Variables (.env.example additions)

```env
# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3000/api/auth/google/callback"

# LinkedIn OAuth
LINKEDIN_CLIENT_ID="your-linkedin-client-id"
LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"
LINKEDIN_CALLBACK_URL="http://localhost:3000/api/auth/linkedin/callback"

# OAuth Token Encryption
OAUTH_ENCRYPTION_KEY="64-character-hex-encryption-key"
```

### 9.2 Configuration Module Updates

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
  oauth: {
    encryptionKey: process.env.OAUTH_ENCRYPTION_KEY,
  },
});
```

---

## 10. Quality Gates

| Gate | Check | Pass/Fail |
|------|-------|-----------|
| Gate 1 | `pnpm lint` passes with no errors | [ ] |
| Gate 2 | `pnpm test` passes with ≥80% coverage | [ ] |
| Gate 3 | `pnpm build` completes successfully | [ ] |
| Gate 4 | Google OAuth flow works end-to-end | [ ] |
| Gate 5 | LinkedIn OAuth flow works end-to-end | [ ] |
| Gate 6 | OAuth identities stored correctly | [ ] |
| Gate 7 | Tokens encrypted before storage | [ ] |
| Gate 8 | New users created with profiles | [ ] |
| Gate 9 | Existing users linked correctly | [ ] |

---

## 11. References

- [Levora Database Design v1.2](../database/Levora_Database_Design_v1.2_MVP.md)
- [System Architecture Design v2.0](../architecture/System_Architecture_Design.md)
- [AGENTS.md](../AGENTS.md)
- [SRS v1.0 Section 3.1](../requirements/Levora_SRS.md#31-authentication-account-management)
- Feature 001: Project Setup & JWT Auth
```

---

