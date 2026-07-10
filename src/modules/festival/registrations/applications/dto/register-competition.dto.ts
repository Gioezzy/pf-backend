import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class RegisterCompetitionDto {
  @ApiProperty({ example: 'uuid-lomba-cerdas-cermat' })
  @IsUUID()
  @IsNotEmpty()
  competitionId: string = '';

  @ApiProperty({ example: 'uuid-gelombang-early-bird' })
  @IsUUID()
  @IsNotEmpty()
  waveId: string = '';

  @ApiPropertyOptional({
    description:
      'Wajib diisi jika ini lomba berkelompok. Kosongkan jika lomba individu.',
    example: 'uuid-tim-alpha',
  })
  @IsOptional()
  @IsUUID()
  teamId?: string;
}
