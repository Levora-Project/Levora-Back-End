import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UserParamsDto {
  @ApiProperty({
    description: 'User ID (cuid)',
    example: 'cm1a2b3c4d5e6f7g8h9i0',
  })
  @IsString()
  @IsNotEmpty()
  id: string;
}
