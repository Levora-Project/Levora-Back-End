import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiPropertyOptional({ example: 'John Doe' })
  fullName?: string | null;

  @ApiProperty({ example: true })
  isDraft: boolean;

  @ApiProperty({ example: 0 })
  completionPct: number;
}

export class UserResponseDto {
  @ApiProperty({ example: '9dd10e8f-0f3c-4295-befb-6109efd2587f' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiPropertyOptional({ example: 'John' })
  firstName?: string | null;

  @ApiPropertyOptional({ example: 'Doe' })
  lastName?: string | null;

  @ApiProperty({ example: false })
  isEmailVerified: boolean;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiPropertyOptional({ example: '2026-08-19T10:00:00.000Z' })
  lastLoginAt?: Date | null;

  @ApiProperty({ example: '2026-08-19T10:00:00.000Z' })
  createdAt: Date;

  @ApiPropertyOptional({ type: UserProfileDto })
  userProfile?: UserProfileDto | null;

  @ApiPropertyOptional({ example: ['user'] })
  roles?: string[];
}
