import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ── Auth message (register / login / refresh) ──
export class AuthMessageResponseDto {
  @ApiProperty({ example: 'Logged in successfully' })
  message: string;
}

// ── Current user profile (GET /auth/me) ──────
export class UserProfileResponseDto {
  @ApiProperty({ example: '019cfb39-6252-72a6-b28e-9c65e3173f9c' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiPropertyOptional({ example: 'John' })
  firstName: string | null;

  @ApiPropertyOptional({ example: 'Doe' })
  lastName: string | null;

  @ApiProperty({ example: 'USER', enum: ['USER', 'ADMIN'] })
  role: string;

  @ApiProperty({ example: '2026-03-05T10:30:00.000Z' })
  createdAt: Date;

  @ApiPropertyOptional({ example: '2026-03-05T10:30:00.000Z' })
  updatedAt: Date | null;
}
