import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSubmissionDto {
  @ApiProperty({ example: 'uuid-registration' })
  @IsUUID()
  @IsNotEmpty()
  registrationId: string = '';

  @ApiProperty({ example: 'Makalah Fisika Kuantum' })
  @IsString()
  @IsNotEmpty()
  title: string = '';

  @ApiPropertyOptional({ example: 'Abstrak mengenai bla bla...' })
  @IsOptional()
  @IsString()
  description?: string;
}
