import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CompetitionParticipantType } from '../../domains/entities/competition.entity';

export class CompetitionWaveDto {
  @ApiProperty({ example: 'uuid-wave' })
  id: string | null = null;

  @ApiProperty({ example: 'Gelombang 1' })
  name: string = '';

  @ApiProperty({ example: 150000 })
  price: number = 0;

  @ApiProperty({ example: '2026-08-01T00:00:00.000Z' })
  startDate: Date = new Date();

  @ApiProperty({ example: '2026-08-30T23:59:59.000Z' })
  endDate: Date = new Date();
}

export class CompetitionResponseDto {
  @ApiProperty({ example: 'uuid-competition' })
  id: string | null = null;

  @ApiProperty({ example: 'Galaxy Research Odyssey (LKTI)' })
  name: string = '';

  @ApiProperty({ enum: CompetitionParticipantType, example: 'TEAM' })
  participantType: CompetitionParticipantType =
    CompetitionParticipantType.INDIVIDUAL;

  @ApiProperty({ example: 2 })
  minTeamMembers: number = 1;

  @ApiProperty({ example: 3 })
  maxTeamMembers: number = 1;

  @ApiPropertyOptional({ example: 'Lomba karya tulis ilmiah...' })
  description: string | null = null;

  @ApiProperty({
    example: true,
    description:
      'True jika lomba ini mewajibkan pengumpulan karya (misal: LKTI). False untuk cerdas cermat.',
  })
  requiresSubmission: boolean = false;

  @ApiProperty({
    example: true,
    description:
      'True jika lomba belum ditutup paksa DAN ada gelombang yang sedang berlangsung hari ini.',
  })
  isOpen: boolean = false;

  @ApiProperty({
    example: true,
    description:
      'Status aktif perlombaan. Jika false, lomba disembunyikan/soft-delete.',
  })
  isActive: boolean = false;

  @ApiPropertyOptional({ type: CompetitionWaveDto, nullable: true })
  activeWave: CompetitionWaveDto | null = null;

  @ApiProperty({ type: [CompetitionWaveDto] })
  waves: CompetitionWaveDto[] = [];

  @ApiPropertyOptional({
    example: 'https://chat.whatsapp.com/xxxxx',
    description:
      'Tautan grup WhatsApp koordinasi peserta lomba. Null jika belum diatur.',
    nullable: true,
  })
  whatsappGroupUrl: string | null = null;
}
