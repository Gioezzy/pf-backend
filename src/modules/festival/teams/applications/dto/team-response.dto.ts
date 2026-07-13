import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TeamMemberDto {
  @ApiProperty({ description: 'ID unik baris relasi' })
  id!: string;

  @ApiProperty({ description: 'ID user anggota' })
  userId!: string;

  @ApiProperty({ description: 'Nama lengkap anggota' })
  fullName!: string;

  @ApiProperty({ description: 'Waktu bergabung ke tim' })
  joinedAt!: Date;

  @ApiPropertyOptional({ description: 'URL avatar anggota' })
  avatarUrl?: string | null;

  @ApiPropertyOptional({ description: 'Asal Sekolah / Instansi' })
  institution?: string;

  @ApiPropertyOptional({ description: 'NPSN Sekolah' })
  npsn?: string | null;
}

export class TeamLeaderDto {
  @ApiProperty({ description: 'ID user ketua' })
  id!: string;

  @ApiProperty({ description: 'Nama lengkap ketua' })
  fullName!: string;

  @ApiProperty({ description: 'Email ketua' })
  email!: string;

  @ApiPropertyOptional({ description: 'URL avatar ketua' })
  avatarUrl?: string | null;

  @ApiPropertyOptional({ description: 'Asal Sekolah / Instansi' })
  institution?: string;

  @ApiPropertyOptional({ description: 'NPSN Sekolah' })
  npsn?: string | null;
}

export class TeamResponseDto {
  @ApiProperty() id: string = '';
  @ApiProperty() name: string = '';
  @ApiProperty() institution: string = '';
  @ApiProperty() leader: TeamLeaderDto = new TeamLeaderDto();
  @ApiProperty({ type: [TeamMemberDto] }) members: TeamMemberDto[] = [];
  @ApiProperty() isRegistered: boolean = false;
  @ApiProperty() createdAt: Date = new Date();
}
