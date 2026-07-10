import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { CreateCompetitionDto } from './create-competition.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateCompetitionDto extends PartialType(
  OmitType(CreateCompetitionDto, ['waves'] as const),
) {
  @ApiPropertyOptional({
    description: 'Gunakan ini untuk me-nonaktifkan lomba (Soft Disable)',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
