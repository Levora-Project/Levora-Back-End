import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { AuthService, AuthTokens } from './auth.service';
import {
  LoginDto,
  AuthMessageResponseDto,
  UserProfileResponseDto,
} from './dto';
import { Public, CurrentUser } from '@common/decorators';
import { ErrorResponse } from '@common/dto';

/** Cookie names */
const ACCESS_COOKIE = 'accessToken';
const REFRESH_COOKIE = 'refreshToken';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  // ── Helpers ──────────────────────────────────
  private setTokenCookies(res: Response, tokens: AuthTokens) {
    const isSecure = this.config.get<boolean>('security.COOKIE_SECURE', false);
    const domain = this.config.get<string>('security.COOKIE_DOMAIN');

    const baseOptions = {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax' as const,
      ...(domain ? { domain } : {}),
    };

    res.cookie(ACCESS_COOKIE, tokens.accessToken, {
      ...baseOptions,
      path: '/',
      maxAge: 15 * 60 * 1000, // 15 min
    });

    res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
      ...baseOptions,
      path: '/api/v1/auth/refresh', // only sent to refresh endpoint
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  private clearTokenCookies(res: Response) {
    const domain = this.config.get<string>('security.COOKIE_DOMAIN');
    const opts = { httpOnly: true, ...(domain ? { domain } : {}) };

    res.clearCookie(ACCESS_COOKIE, { ...opts, path: '/' });
    res.clearCookie(REFRESH_COOKIE, { ...opts, path: '/api/v1/auth/refresh' });
  }

  // ── Endpoints ────────────────────────────────
  @Public()
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: 200,
    description: 'Login successful, cookies set',
    type: AuthMessageResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
    type: ErrorResponse,
  })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthMessageResponseDto> {
    const tokens = await this.authService.login(dto);
    this.setTokenCookies(res, tokens);
    return { message: 'Logged in successfully' };
  }

  @Public()
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token (via cookie)' })
  @ApiResponse({
    status: 200,
    description: 'New tokens set in cookies',
    type: AuthMessageResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid refresh token',
    type: ErrorResponse,
  })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthMessageResponseDto> {
    const refreshToken = (req.cookies as Record<string, string>)?.[
      REFRESH_COOKIE
    ];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }
    const tokens = await this.authService.refresh(refreshToken);
    this.setTokenCookies(res, tokens);
    return { message: 'Tokens refreshed successfully' };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout (clear cookies)' })
  @ApiResponse({ status: 204, description: 'Logged out' })
  logout(@Res({ passthrough: true }) res: Response): void {
    this.clearTokenCookies(res);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Current user profile',
    type: UserProfileResponseDto,
  })
  getProfile(@CurrentUser('id') userId: string) {
    return this.authService.getMe(userId);
  }
}
