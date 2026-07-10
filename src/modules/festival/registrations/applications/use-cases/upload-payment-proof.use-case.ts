import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { RegistrationResponseDto } from '../dto/registration-response.dto';
import {
  type IRegistrationRepository,
  REGISTRATION_REPOSITORY_TOKEN,
} from '../../infrastructures/repositories/registration.repository.interface';
import { RegistrationStatus } from '../../domains/entities/registration.entity';
import {
  PaymentAttemptEntity,
  PaymentAttemptStatus,
} from '../../domains/entities/payment-attempt.entity';
import { RegistrationDomainService } from '../../domains/services/registration-domain.service';
import { RegistrationMapper } from '../../domains/mappers/registration.mapper';
import { StorageOrchestrator } from '../../../../shared/storage/applications/orchestrator/storage.orchestrator';
import { FilePurpose } from '../../../../shared/storage/domains/entities/stored-file.entity';
import { NotificationsService } from '../../../../shared/notifications/notifications.service';
import { UserRole } from '../../../../identity/users/domains/entities/user.entity';

@Injectable()
export class UploadPaymentProofUseCase {
  constructor(
    @Inject(REGISTRATION_REPOSITORY_TOKEN)
    private readonly regRepo: IRegistrationRepository,
    private readonly domainService: RegistrationDomainService,
    private readonly mapper: RegistrationMapper,
    private readonly storageOrchestrator: StorageOrchestrator,
    private readonly notificationsService: NotificationsService,
  ) {}

  async execute(
    registrationId: string,
    userId: string,
    file: Express.Multer.File | undefined,
  ): Promise<RegistrationResponseDto> {
    const registration = await this.regRepo.findById(registrationId);
    if (!registration) {
      throw new NotFoundException('Data pendaftaran tidak ditemukan.');
    }

    this.domainService.assertCanManageProof(registration, userId);
    this.domainService.assertCanUploadProof(registration);

    const uploaded = await this.storageOrchestrator.upload(
      file,
      { context: 'payment-proofs', purpose: FilePurpose.PAYMENT_PROOF },
      userId,
    );

    const newAttempt = new PaymentAttemptEntity();
    newAttempt.proofOfPaymentFileId = uploaded.storedFileId;
    newAttempt.proofOfPaymentUrl = uploaded.fileUrl;
    newAttempt.status = PaymentAttemptStatus.PENDING;

    if (!registration.paymentAttempts) {
      registration.paymentAttempts = [];
    }
    registration.paymentAttempts.push(newAttempt);
    registration.status = RegistrationStatus.PENDING_VERIFICATION;

    const saved = await this.regRepo.save(registration);
    const complete = await this.regRepo.findById(saved.id);

    // Notify ADMIN and TREASURER
    const participantName =
      complete?.team?.name || complete?.user?.email || 'Peserta';
    await this.notificationsService.sendToRoles(
      [UserRole.ADMIN, UserRole.TREASURER],
      {
        title: 'Pembayaran Baru',
        message: `${participantName} telah mengunggah bukti pembayaran untuk lomba ${complete?.competition?.name}. Silakan tinjau dan verifikasi.`,
        type: 'INFO',
      },
    );

    return this.mapper.toResponseDto(complete!);
  }
}
