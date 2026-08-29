import { Test, TestingModule } from '@nestjs/testing';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { OAuthService } from './services/oauth.service';
import { OAuthGuard } from './guards/oauth.guard';
import { EncryptionService } from './services/encryption.service';
import { OauthIdentityService } from './services/oauth-identity.service';
import { OAuthProcessorService } from './services/oauth-processor.service';
import { PrismaService } from '@/prisma';
import { UsersService } from '@/modules/users/users.service';

// Mock the strategies to avoid constructor errors
jest.mock('./strategies/google.strategy');
jest.mock('./strategies/linkedin.strategy');
jest.mock('./config/providers.config', () => ({
  getProviderConfig: jest.fn().mockReturnValue({
    clientId: 'test-id',
    clientSecret: 'test-secret',
    redirect: 'http://localhost:3000/api/v1/auth/test/callback',
  }),
  getConfiguredProviders: jest.fn().mockReturnValue(['google', 'linkedin']),
  getSupportedProviders: jest.fn().mockReturnValue(['google', 'linkedin']),
}));

describe('AuthModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        PassportModule,
        ConfigModule.forRoot({ isGlobal: true }),
        LoggerModule.forRoot({ pinoHttp: { level: 'silent' } }),
        AuthModule,
      ],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(UsersService)
      .useValue({})
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn().mockImplementation((key: string) => {
          if (
            key === 'oauth.OAUTH_ENCRYPTION_KEY' ||
            key === 'OAUTH_ENCRYPTION_KEY'
          ) {
            return '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
          }
          return undefined;
        }),
      })
      .compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide AuthService', () => {
    const service = module.get<AuthService>(AuthService);
    expect(service).toBeDefined();
  });

  it('should provide JwtStrategy', () => {
    const strategy = module.get<JwtStrategy>(JwtStrategy);
    expect(strategy).toBeDefined();
  });

  it('should provide JwtAuthGuard', () => {
    const guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    expect(guard).toBeDefined();
  });

  it('should provide OAuthService', () => {
    const service = module.get<OAuthService>(OAuthService);
    expect(service).toBeDefined();
  });

  it('should provide OAuthGuard', () => {
    const guard = module.get<OAuthGuard>(OAuthGuard);
    expect(guard).toBeDefined();
  });

  it('should provide EncryptionService', () => {
    const encryption = module.get<EncryptionService>(EncryptionService);
    expect(encryption).toBeDefined();
  });

  it('should provide OauthIdentityService', () => {
    const identity = module.get<OauthIdentityService>(OauthIdentityService);
    expect(identity).toBeDefined();
  });

  it('should provide OAuthProcessorService', () => {
    const processor = module.get<OAuthProcessorService>(OAuthProcessorService);
    expect(processor).toBeDefined();
  });
});
