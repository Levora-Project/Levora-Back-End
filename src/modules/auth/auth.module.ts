import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { PrismaModule } from '@/prisma';
import { UsersModule } from '@/modules/users/users.module';
import {
  UsersRepository,
  UserRolesRepository,
} from '@/modules/users/repositories';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { OAuthGuard } from './guards/oauth.guard';
import {
  EncryptionService,
  OauthIdentityService,
  OAuthProcessorService,
  OAuthService,
} from './services';
import { getAllStrategyClasses } from './config/strategy.registry';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret:
          config.get<string>('security.JWT_SECRET') ||
          config.get<string>('JWT_SECRET') ||
          'dev-only-secret-do-not-use-in-production!!',
        signOptions: {
          expiresIn: config.get<string>(
            'security.JWT_ACCESS_EXPIRES',
            '15m',
          ) as `${number}${'s' | 'm' | 'h' | 'd'}`,
        },
      }),
    }),
    PrismaModule,
    forwardRef(() => UsersModule),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    UsersRepository,
    UserRolesRepository,
    OAuthService,
    OAuthGuard,
    EncryptionService,
    OauthIdentityService,
    OAuthProcessorService,
    ...getAllStrategyClasses(),
  ],
  exports: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    OAuthService,
    OAuthGuard,
    EncryptionService,
    OauthIdentityService,
    OAuthProcessorService,
  ],
})
export class AuthModule {}
