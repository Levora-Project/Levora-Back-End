import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';

export class UserParamsDto {
  @ApiProperty({
    description: 'User ID (UUID)',
    example: '9dd10e8f-0f3c-4295-befb-6109efd2587f',
  })
  @IsUUID('4', { message: 'id must be a valid UUID' })
  @IsNotEmpty()
  id: string;
}
