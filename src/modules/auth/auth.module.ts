import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {
  UsersRepository,
  UserRolesRepository,
} from '@/modules/users/repositories';

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('security.JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>(
            'security.JWT_ACCESS_EXPIRES',
            '15m',
          ) as `${number}${'s' | 'm' | 'h' | 'd'}`,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersRepository, UserRolesRepository],
  exports: [AuthService],
})
export class AuthModule {}
