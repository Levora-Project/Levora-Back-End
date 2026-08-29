import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { PrismaService } from '@/prisma';
import { EncryptionService } from './encryption.service';
import { OauthIdentityService } from './oauth-identity.service';
import { OAuthLoginData } from '../interfaces/oauth-profile.interface';
import { UserResponseDto } from '../dto/user-response.dto';

export interface OAuthAuthResult {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDto;
}

interface OAuthUserWithRelations {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  isEmailVerified?: boolean;
  isActive?: boolean;
  lastLoginAt?: Date | null;
  createdAt?: Date;
  userProfile?: {
    fullName?: string | null;
    completionPct?: number | null;
    isDraft?: boolean | null;
  } | null;
  userRoles?: Array<{
    roles?: {
      name?: string;
    } | null;
  }>;
  roles?: string[];
}

@Injectable()
export class OAuthProcessorService {
  constructor(
    @InjectPinoLogger(OAuthProcessorService.name)
    private readonly logger: PinoLogger,
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
    private readonly oauthIdentityService: OauthIdentityService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Main processor for OAuth logins/signups.
   * Handles email validation, token encryption, identity lookup/linking, user creation, and JWT generation.
   */
  async processOAuthLogin(data: OAuthLoginData): Promise<OAuthAuthResult> {
    const {
      provider,
      providerUserId,
      email,
      firstName,
      lastName,
      picture,
      accessToken,
      refreshToken,
    } = data;

    // 1. Email validation (FR-002-19)
    if (!email || email.trim() === '') {
      this.logger.warn(
        `OAuth login failed: Missing email for provider ${provider}, user ID ${providerUserId}`,
      );
      throw new BadRequestException(
        'Unable to retrieve email from the provider. Please ensure your email is public or use another login method.',
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Encrypt tokens before storing
    const encryptedAccessToken = this.encryptionService.encrypt(accessToken);
    const encryptedRefreshToken = refreshToken
      ? this.encryptionService.encrypt(refreshToken)
      : null;

    // 3. Check for existing OAuth identity
    const existingIdentity = await this.oauthIdentityService.findByProvider(
      provider,
      providerUserId,
    );

    if (existingIdentity && existingIdentity.user) {
      if (!existingIdentity.user.isActive) {
        this.logger.warn(
          `OAuth login rejected: User ${existingIdentity.user.id} is deactivated`,
        );
        throw new UnauthorizedException('Account is deactivated');
      }

      // Update tokens on existing identity
      await this.oauthIdentityService.update(existingIdentity.id, {
        accessTokenRef: encryptedAccessToken,
        refreshTokenRef: encryptedRefreshToken,
      });

      // Update last login
      await this.prisma.users.update({
        where: { id: existingIdentity.user.id },
        data: { lastLoginAt: new Date() },
      });

      this.logger.info(
        `OAuth login existing identity: ${existingIdentity.user.email} (${provider})`,
      );

      return this.generateAuthResponse(existingIdentity.user);
    }

    // 4. Check for existing user by email
    const existingUser = await this.prisma.users.findUnique({
      where: { email: normalizedEmail },
      include: {
        userProfile: true,
        userRoles: {
          include: {
            roles: true,
          },
        },
      },
    });

    if (existingUser) {
      if (!existingUser.isActive) {
        this.logger.warn(
          `OAuth login rejected: User ${existingUser.id} is deactivated`,
        );
        throw new UnauthorizedException('Account is deactivated');
      }

      // Link OAuth identity to existing user (FR-002-08)
      await this.oauthIdentityService.create({
        userId: existingUser.id,
        provider,
        providerUserId,
        accessTokenRef: encryptedAccessToken,
        refreshTokenRef: encryptedRefreshToken,
      });

      // Mark email verified if not already, and update last login
      const updatedUser = await this.prisma.users.update({
        where: { id: existingUser.id },
        data: {
          isEmailVerified: true,
          lastLoginAt: new Date(),
        },
        include: {
          userProfile: true,
          userRoles: {
            include: {
              roles: true,
            },
          },
        },
      });

      this.logger.info(
        `OAuth identity linked to existing user: ${updatedUser.email} (${provider})`,
      );

      return this.generateAuthResponse(updatedUser);
    }

    // 5. Create new user (FR-002-07, FR-002-09, FR-002-10, FR-002-12)
    const fullName =
      [firstName, lastName].filter(Boolean).join(' ') ||
      normalizedEmail.split('@')[0];

    // Find default role 'user'
    const defaultRole = await this.prisma.roles.findUnique({
      where: { name: 'user' },
    });
    const roleId = defaultRole ? defaultRole.id : 1;

    const newUser = await this.prisma.users.create({
      data: {
        email: normalizedEmail,
        firstName: firstName || null,
        lastName: lastName || null,
        isEmailVerified: true,
        isActive: true,
        lastLoginAt: new Date(),
        userProfile: {
          create: {
            fullName,
            profilePhotoUrl: picture || null,
            isDraft: true,
            completionPct: 0,
          },
        },
        userRoles: {
          create: {
            roleId,
          },
        },
        oauthIdentities: {
          create: {
            provider,
            providerUserId,
            accessTokenRef: encryptedAccessToken,
            refreshTokenRef: encryptedRefreshToken,
          },
        },
      },
      include: {
        userProfile: true,
        userRoles: {
          include: {
            roles: true,
          },
        },
      },
    });

    this.logger.info(
      `New user created via OAuth: ${newUser.email} (${provider})`,
    );

    return this.generateAuthResponse(newUser);
  }

  /**
   * Helper to format UserResponseDto and generate JWT tokens.
   */
  private async generateAuthResponse(
    user: OAuthUserWithRelations,
  ): Promise<OAuthAuthResult> {
    const roles: string[] = Array.isArray(user.userRoles)
      ? user.userRoles.map((ur) => ur.roles?.name || 'user')
      : user.roles || ['user'];

    const primaryRole = roles[0] || 'user';

    const payload = {
      sub: user.id,
      email: user.email,
      role: primaryRole,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: this.config.get<string>(
          'security.JWT_ACCESS_EXPIRES',
          '15m',
        ) as `${number}${'s' | 'm' | 'h' | 'd'}`,
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: this.config.get<string>(
          'security.JWT_REFRESH_EXPIRES',
          '7d',
        ) as `${number}${'s' | 'm' | 'h' | 'd'}`,
      }),
    ]);

    const userResponse: UserResponseDto = {
      id: user.id,
      email: user.email,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      isEmailVerified: user.isEmailVerified ?? true,
      isActive: user.isActive ?? true,
      lastLoginAt: user.lastLoginAt ?? new Date(),
      createdAt: user.createdAt ?? new Date(),
      userProfile: user.userProfile
        ? {
            fullName: user.userProfile.fullName || '',
            completionPct: user.userProfile.completionPct || 0,
            isDraft: user.userProfile.isDraft ?? true,
          }
        : null,
      roles,
    };

    return {
      accessToken,
      refreshToken,
      user: userResponse,
    };
  }
}
