import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTeamDto {
  @ApiProperty({ example: 'Tim Alpha 1' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string = '';
}
