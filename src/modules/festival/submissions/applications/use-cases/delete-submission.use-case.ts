import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import {
  type ISubmissionRepository,
  SUBMISSION_REPOSITORY_TOKEN,
} from '../../infrastructures/repositories/submission.repository.interface';
import {
  type IRegistrationRepository,
  REGISTRATION_REPOSITORY_TOKEN,
} from '../../../registrations/infrastructures/repositories/registration.repository.interface';
import { SubmissionStatus } from '../../domains/entities/submission.entity';
import { StorageOrchestrator } from '../../../../shared/storage/applications/orchestrator/storage.orchestrator';

@Injectable()
export class DeleteSubmissionUseCase {
  constructor(
    @Inject(SUBMISSION_REPOSITORY_TOKEN)
    private readonly subRepo: ISubmissionRepository,
    @Inject(REGISTRATION_REPOSITORY_TOKEN)
    private readonly regRepo: IRegistrationRepository,
    private readonly storageOrchestrator: StorageOrchestrator,
  ) {}

  async execute(submissionId: string, userId: string): Promise<void> {
    const submission = await this.subRepo.findById(submissionId);
    if (!submission) throw new NotFoundException('Data karya tidak ditemukan.');

    const registration = await this.regRepo.findById(submission.registrationId);
    const isOwner = registration?.userId === userId;
    const isTeamLeader = registration?.team?.leaderId === userId;

    if (!isOwner && !isTeamLeader) {
      throw new ForbiddenException('Anda tidak berhak menghapus karya ini.');
    }

    if (submission.status === SubmissionStatus.GRADED) {
      throw new BadRequestException(
        'Karya tidak dapat dihapus karena sudah dinilai oleh dewan juri.',
      );
    }

    // Eksekusi hard delete fisik dan database
    if (submission.storedFileId) {
      await this.storageOrchestrator.delete(submission.storedFileId, userId);
    }
    await this.subRepo.delete(submissionId);
  }
}
