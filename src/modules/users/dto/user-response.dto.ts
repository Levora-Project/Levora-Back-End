import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginatedResponse, SuccessResponse } from '@common/dto/response.dto';

// ── Single user ───────────────────────────────
export class UserResponseDto {
  @ApiProperty({ example: '019cfb39-6252-72a6-b28e-9c65e3173f9c' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiPropertyOptional({ example: 'John' })
  firstName: string | null;

  @ApiPropertyOptional({ example: 'Doe' })
  lastName: string | null;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-03-05T10:30:00+00:00' })
  createdAt: string;

  @ApiPropertyOptional({ example: '2026-03-05T10:30:00+00:00', nullable: true })
  updatedAt: string | null;
}

// ── Swagger envelope wrappers ─────────────────
export class UserDataResponse extends SuccessResponse<UserResponseDto> {
  @ApiProperty({ type: UserResponseDto })
  declare data: UserResponseDto;
}

export class UserListResponseDto extends PaginatedResponse<UserResponseDto> {
  @ApiProperty({ type: [UserResponseDto] })
  declare data: UserResponseDto[];
}
