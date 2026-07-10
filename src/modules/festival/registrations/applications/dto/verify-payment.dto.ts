// registrations/applications/dto/verify-payment.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum VerificationAction {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

export class VerifyPaymentDto {
  @ApiProperty({
    enum: VerificationAction,
    example: VerificationAction.APPROVE,
    description:
      'Keputusan bendahara terhadap bukti pembayaran yang diunggah peserta.',
  })
  @IsEnum(VerificationAction)
  action: VerificationAction = VerificationAction.APPROVE;

  @ApiPropertyOptional({
    description:
      'Catatan bendahara. Wajib diisi jika action = REJECT (misal: nominal tidak sesuai, bukti buram, dll).',
    example: 'Nominal transfer tidak sesuai dengan tagihan.',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  note?: string;
}
