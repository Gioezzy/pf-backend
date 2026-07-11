import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  RegistrationStatus,
  ChampionTitle,
} from '../../domains/entities/registration.entity';
import { PaymentAttemptStatus } from '../../domains/entities/payment-attempt.entity';

export class PaymentAttemptDto {
  @ApiProperty() id: string = '';
  @ApiProperty() proofOfPaymentUrl: string = '';
  @ApiProperty({ enum: PaymentAttemptStatus }) status: PaymentAttemptStatus =
    PaymentAttemptStatus.PENDING;
  @ApiPropertyOptional() rejectionReason?: string | null;
  @ApiPropertyOptional() verifiedAt?: Date | null;
  @ApiProperty() uploadedAt: Date = new Date();
}

export class TeamMemberDto {
  @ApiProperty() name: string = '';
  @ApiPropertyOptional() avatar?: string | null = null;
  @ApiPropertyOptional() email?: string | null = null;
  @ApiPropertyOptional() phone?: string | null = null;
}

export class RegistrationResponseDto {
  @ApiProperty() id: string = '';
  @ApiProperty() competitionId: string = '';
  @ApiProperty() competitionName: string = '';
  @ApiProperty() waveName: string = '';

  @ApiPropertyOptional() teamName: string | null = null;
  @ApiPropertyOptional() teamLeaderId: string | null = null;
  @ApiPropertyOptional() participantName: string | null = null;
  @ApiPropertyOptional() participantAvatar: string | null = null;
  @ApiPropertyOptional() participantEmail: string | null = null;
  @ApiPropertyOptional() participantPhone: string | null = null;

  @ApiPropertyOptional() institution?: string | null = null;
  @ApiPropertyOptional({ type: [TeamMemberDto] }) members?: TeamMemberDto[] =
    [];

  @ApiProperty({ enum: RegistrationStatus })
  status: RegistrationStatus = RegistrationStatus.PENDING_PAYMENT;
  @ApiProperty({ enum: ChampionTitle })
  championTitle: ChampionTitle = ChampionTitle.NONE;
  @ApiProperty() registeredAt: Date = new Date();

  @ApiPropertyOptional({
    description: 'URL bukti pembayaran yang diunggah peserta.',
  })
  proofOfPaymentUrl?: string | null;
  @ApiPropertyOptional({ description: 'Waktu bukti pembayaran diunggah.' })
  proofUploadedAt?: Date | null;

  @ApiPropertyOptional({
    description: 'Catatan dari bendahara (terutama jika ditolak).',
  })
  verificationNote?: string | null;
  @ApiPropertyOptional({ description: 'Waktu verifikasi oleh bendahara.' })
  verifiedAt?: Date | null;

  @ApiProperty({ type: [PaymentAttemptDto] })
  paymentAttempts: PaymentAttemptDto[] = [];

  @ApiPropertyOptional({
    description:
      'Tautan grup WhatsApp lomba. Hanya tersedia setelah pembayaran terverifikasi.',
    nullable: true,
  })
  whatsappGroupUrl: string | null = null;
}
