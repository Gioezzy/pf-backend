import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateSubmissionDto } from '../dto/create-submission.dto';
import { SubmissionResponseDto } from '../dto/submission-response.dto';
import {
  SubmissionEntity,
  SubmissionStatus,
} from '../../domains/entities/submission.entity';
import {
  type ISubmissionRepository,
  SUBMISSION_REPOSITORY_TOKEN,
} from '../../infrastructures/repositories/submission.repository.interface';
import { SubmissionDomainService } from '../../domains/services/submission-domain.service';
import { SubmissionMapper } from '../../domains/mappers/submission.mapper';
import {
  type IRegistrationRepository,
  REGISTRATION_REPOSITORY_TOKEN,
} from '../../../registrations/infrastructures/repositories/registration.repository.interface';
import { NotificationsService } from '../../../../shared/notifications/notifications.service';
import { UserRole } from '../../../../identity/users/domains/entities/user.entity';

@Injectable()
export class CreateSubmissionUseCase {
  constructor(
    @Inject(SUBMISSION_REPOSITORY_TOKEN)
    private readonly subRepo: ISubmissionRepository,
    @Inject(REGISTRATION_REPOSITORY_TOKEN)
    private readonly regRepo: IRegistrationRepository,
    private readonly domainService: SubmissionDomainService,
    private readonly mapper: SubmissionMapper,
    private readonly notificationsService: NotificationsService,
  ) {}

  async execute(
    userId: string,
    dto: CreateSubmissionDto,
    fileUrl: string,
    storedFileId: string,
    originalityFileUrl?: string,
    originalityStoredFileId?: string,
  ): Promise<SubmissionResponseDto> {
    // 1. Validasi eksistensi pendaftaran
    const registration = await this.regRepo.findById(dto.registrationId);
    if (!registration) {
      throw new BadRequestException('Data pendaftaran tidak ditemukan.');
    }

    // 2. Validasi aturan bisnis murni
    this.domainService.validateRegistrationEligibility(registration, userId);

    // 3. Persiapkan Entitas
    const submission = new SubmissionEntity();
    submission.registrationId = dto.registrationId;
    submission.title = dto.title;
    submission.description = dto.description ?? null;
    submission.fileUrl = fileUrl;
    submission.storedFileId = storedFileId;
    submission.originalityFileUrl = originalityFileUrl ?? null;
    submission.originalityStoredFileId = originalityStoredFileId ?? null;
    submission.status = SubmissionStatus.SUBMITTED;

    // 4. Simpan ke database
    try {
      const savedSub = await this.subRepo.save(submission);
      if (!savedSub.id)
        throw new InternalServerErrorException('Gagal menyimpan karya.');

      const completeSub = await this.subRepo.findById(savedSub.id);

      // Notify ADMIN and COMMITTEE
      const participantName =
        registration.team?.name || registration.user?.email || 'Peserta';
      await this.notificationsService.sendToRoles(
        [UserRole.ADMIN, UserRole.COMMITTEE],
        {
          title: 'Submission Baru',
          message: `${participantName} telah mengumpulkan submission untuk lomba ${registration.competition?.name}. Silakan tinjau karya mereka.`,
          type: 'INFO',
        },
      );

      return this.mapper.toResponseDto(completeSub!);
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null) {
        const errObj = error as Record<string, unknown>;
        const code = errObj.code;
        const errno = errObj.errno;

        if (code === '23505' || code === 'ER_DUP_ENTRY' || errno === 1062) {
          throw new ConflictException(
            'Karya untuk pendaftaran ini sudah pernah diunggah.',
          );
        }
      }
      console.error('Submission Error:', error);
      throw new InternalServerErrorException(
        'Terjadi kesalahan saat mengunggah karya.',
      );
    }
  }
}
