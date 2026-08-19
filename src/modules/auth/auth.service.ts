import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import {
  UsersRepository,
  UserRolesRepository,
} from '@/modules/users/repositories';
import { LoginDto } from './dto';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectPinoLogger(AuthService.name)
    private readonly logger: PinoLogger,
    private readonly usersRepo: UsersRepository,
    private readonly userRolesRepo: UserRolesRepository,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ── Login ────────────────────────────────────
  async login(dto: LoginDto): Promise<AuthTokens> {
    const user = await this.usersRepo.findUniqueRaw({
      where: { email: dto.email },
      select: { id: true, email: true, password: true, isActive: true },
    });

    if (!user || !user.isActive) {
      this.logger.warn(
        `Failed login attempt: ${dto.email} (user not found or inactive)`,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.password) {
      this.logger.warn(
        `Failed login attempt: ${dto.email} (SSO-only account, no password)`,
      );
      throw new UnauthorizedException(
        'This account uses SSO login. Please sign in with your provider.',
      );
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      this.logger.warn(`Failed login attempt: ${dto.email} (wrong password)`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const role = await this.userRolesRepo.getCurrentRoleName(user.id);
    this.logger.info(`User logged in: ${user.email}`);
    return this.generateTokens(user.id, user.email, role);
  }

  // ── Refresh (stateless — verify JWT signature) ─
  async refresh(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken);
      const user = await this.usersRepo.findByIdRaw(payload.sub, {
        select: { id: true, email: true, isActive: true },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Account is deactivated');
      }

      const role = await this.userRolesRepo.getCurrentRoleName(user.id);
      return await this.generateTokens(user.id, user.email, role);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  // ── Validate JWT payload (used by guard — every request) ─
  async validateUser(payload: JwtPayload) {
    const user = await this.usersRepo.findByIdRaw(payload.sub, {
      select: { id: true, email: true, isActive: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or deactivated');
    }

    const role = await this.userRolesRepo.getCurrentRoleName(user.id);
    return { ...user, role };
  }

  // ── Get full profile (GET /auth/me) ──────────
  async getMe(userId: string) {
    const user = await this.usersRepo.findById(userId);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or deactivated');
    }

    const role = await this.userRolesRepo.getCurrentRoleName(user.id);
    return { ...user, role };
  }

  // ── Token generation helpers ─────────────────
  private async generateTokens(
    userId: string,
    email: string,
    role: string,
  ): Promise<AuthTokens> {
    const payload: JwtPayload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        expiresIn: this.config.get<string>(
          'security.JWT_ACCESS_EXPIRES',
          '15m',
        ) as `${number}${'s' | 'm' | 'h' | 'd'}`,
      }),
      this.jwt.signAsync(payload, {
        expiresIn: this.config.get<string>(
          'security.JWT_REFRESH_EXPIRES',
          '7d',
        ) as `${number}${'s' | 'm' | 'h' | 'd'}`,
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
