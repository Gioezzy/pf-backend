import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateWaveDto {
  @ApiPropertyOptional({
    description: 'Nama gelombang',
    example: 'Gelombang 1 (Revisi)',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Harga pendaftaran', example: 75000 })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ description: 'Tanggal buka pendaftaran' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiPropertyOptional({ description: 'Tanggal tutup pendaftaran' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;
}
