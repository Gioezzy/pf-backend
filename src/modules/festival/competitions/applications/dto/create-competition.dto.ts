import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  ValidateNested,
  IsDate,
  IsBoolean,
  IsUrl,
} from 'class-validator';
import { CompetitionParticipantType } from '../../domains/entities/competition.entity';

export class CreateCompetitionWaveDto {
  @ApiProperty()
  @IsString()
  name: string = '';

  @ApiProperty()
  @IsNumber()
  price: number = 0;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  startDate: Date = new Date();

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  endDate: Date = new Date();
}

export class CreateCompetitionDto {
  @ApiProperty()
  @IsString()
  name: string = '';

  @ApiProperty({ enum: CompetitionParticipantType })
  @IsEnum(CompetitionParticipantType)
  participantType: CompetitionParticipantType =
    CompetitionParticipantType.INDIVIDUAL;

  @ApiProperty()
  @IsNumber()
  minTeamMembers: number = 1;

  @ApiProperty()
  @IsNumber()
  maxTeamMembers: number = 1;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Apakah lomba ini mewajibkan pengumpulan karya?',
  })
  @IsOptional()
  @IsBoolean()
  requiresSubmission?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Apakah lomba aktif?',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ type: [CreateCompetitionWaveDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateCompetitionWaveDto)
  waves?: CreateCompetitionWaveDto[];

  @ApiPropertyOptional({
    example: 'https://chat.whatsapp.com/xxxxx',
    description: 'Tautan grup WhatsApp koordinasi. Opsional.',
  })
  @IsOptional()
  @IsUrl({}, { message: 'whatsappGroupUrl harus berupa URL yang valid.' })
  whatsappGroupUrl?: string;
}
