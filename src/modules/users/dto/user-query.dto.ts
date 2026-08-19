import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsIn } from 'class-validator';
import { PaginationDto } from '@common/dto';

const SORTABLE_FIELDS = [
  'createdAt',
  'updatedAt',
  'email',
  'name',
  'role',
] as const;

export type UserSortField = (typeof SORTABLE_FIELDS)[number];

export class UserQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search by name or email',
    example: 'john',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by role',
    enum: ['USER', 'ADMIN'],
    example: 'USER',
  })
  @IsEnum(['USER', 'ADMIN'])
  @IsOptional()
  role?: string;

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: SORTABLE_FIELDS,
    default: 'createdAt',
    example: 'updatedAt',
  })
  @IsIn(SORTABLE_FIELDS)
  @IsOptional()
  sort?: UserSortField = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    default: 'desc',
    example: 'desc',
  })
  @IsIn(['asc', 'desc'])
  @IsOptional()
  order?: 'asc' | 'desc' = 'desc';
}
