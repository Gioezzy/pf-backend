// src/festival/competitions/applications/dto/competition-wave-response.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class CompetitionWaveResponseDto {
  @ApiProperty({
    description: 'UUID dari gelombang pendaftaran',
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
  })
  id: string = '';

  @ApiProperty({
    description: 'Nama gelombang pendaftaran',
    example: 'Gelombang 1',
  })
  name: string = '';

  @ApiProperty({
    description: 'Harga pendaftaran untuk gelombang ini (dalam Rupiah)',
    example: 150000,
  })
  price: number = 0;

  @ApiProperty({
    description: 'Tanggal dan waktu gelombang pendaftaran mulai dibuka',
    example: '2026-08-01T00:00:00.000Z',
  })
  startDate: Date = new Date();

  @ApiProperty({
    description: 'Tanggal dan waktu gelombang pendaftaran ditutup',
    example: '2026-08-30T23:59:59.000Z',
  })
  endDate: Date = new Date();
}
