import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RegistrationResponseDto } from '../dto/registration-response.dto';
import {
  VerificationAction,
  VerifyPaymentDto,
} from '../dto/verify-payment.dto';
import {
  type IRegistrationRepository,
  REGISTRATION_REPOSITORY_TOKEN,
} from '../../infrastructures/repositories/registration.repository.interface';
import { RegistrationStatus } from '../../domains/entities/registration.entity';
import { PaymentAttemptStatus } from '../../domains/entities/payment-attempt.entity';
import { RegistrationDomainService } from '../../domains/services/registration-domain.service';
import { RegistrationMapper } from '../../domains/mappers/registration.mapper';
import { NotificationsService } from '../../../../shared/notifications/notifications.service';
import { UserRole } from '../../../../identity/users/domains/entities/user.entity';

@Injectable()
export class VerifyPaymentUseCase {
  constructor(
    @Inject(REGISTRATION_REPOSITORY_TOKEN)
    private readonly regRepo: IRegistrationRepository,
    private readonly domainService: RegistrationDomainService,
    private readonly mapper: RegistrationMapper,
    private readonly notificationsService: NotificationsService,
  ) {}

  async execute(
    registrationId: string,
    bendaharaUserId: string,
    dto: VerifyPaymentDto,
  ): Promise<RegistrationResponseDto> {
    const registration = await this.regRepo.findById(registrationId);
    if (!registration) {
      throw new NotFoundException('Data pendaftaran tidak ditemukan.');
    }

    this.domainService.assertCanVerify(registration);

    if (dto.action === VerificationAction.REJECT && !dto.note?.trim()) {
      throw new BadRequestException(
        'Catatan penolakan wajib diisi agar peserta tahu apa yang perlu diperbaiki.',
      );
    }

    const attempts = registration.paymentAttempts || [];
    attempts.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
    const latestAttempt = attempts[0];

    if (!latestAttempt) {
      throw new BadRequestException(
        'Tidak ada bukti pembayaran yang dapat diverifikasi.',
      );
    }

    const isApprove = dto.action === VerificationAction.APPROVE;

    latestAttempt.status = isApprove
      ? PaymentAttemptStatus.APPROVED
      : PaymentAttemptStatus.REJECTED;
    latestAttempt.rejectionReason = dto.note ?? null;
    latestAttempt.verifiedAt = new Date();
    latestAttempt.verifiedBy = bendaharaUserId;

    registration.status = isApprove
      ? RegistrationStatus.VERIFIED
      : RegistrationStatus.REJECTED;

    const saved = await this.regRepo.save(registration);
    const complete = await this.regRepo.findById(saved.id);

    // Send notification to the participant
    const targetUserId = registration.team?.leaderId || registration.userId;
    if (targetUserId) {
      const waLink = registration.competition?.whatsappGroupUrl;
      const approvalMessage = waLink
        ? `Selamat! Pembayaran Anda untuk lomba ${registration.competition?.name} telah diverifikasi. Silakan bergabung ke grup koordinasi WhatsApp melalui link berikut: ${waLink}`
        : `Selamat! Pembayaran Anda untuk lomba ${registration.competition?.name} telah diverifikasi. Sampai jumpa di lomba!`;
      await this.notificationsService.sendNotification({
        userId: targetUserId,
        title: isApprove ? 'Pembayaran Disetujui' : 'Pembayaran Ditolak',
        message: isApprove
          ? approvalMessage
          : `Maaf, pembayaran Anda ditolak dengan alasan: ${dto.note}. Silakan unggah bukti yang benar.`,
        type: isApprove ? 'SUCCESS' : 'ERROR',
      });
    }

    // Notify ADMIN that payment has been verified by TREASURER
    const participantName =
      registration.team?.name || registration.user?.email || 'Peserta';
    const statusText = isApprove ? 'menyetujui' : 'menolak';
    await this.notificationsService.sendToRoles([UserRole.ADMIN], {
      title: `Pembayaran ${isApprove ? 'Disetujui' : 'Ditolak'}`,
      message: `Bendahara telah ${statusText} pembayaran dari ${participantName} untuk lomba ${registration.competition?.name}.`,
      type: 'INFO',
    });

    return this.mapper.toResponseDto(complete!);
  }
}
