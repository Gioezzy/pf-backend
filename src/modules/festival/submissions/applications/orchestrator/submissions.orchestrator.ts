import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateSubmissionDto } from '../dto/create-submission.dto';
import { SubmissionResponseDto } from '../dto/submission-response.dto';
import { CreateSubmissionUseCase } from '../use-cases/create-submission.use-case';
import { StorageOrchestrator } from '../../../../shared/storage/applications/orchestrator/storage.orchestrator';
import { GetMySubmissionUseCase } from '../use-cases/get-my-submission.use-case';
import { DeleteSubmissionUseCase } from '../use-cases/delete-submission.use-case';
import { GetSubmissionsByCompetitionUseCase } from '../use-cases/get-submissions-by-competition.use-case';
@Injectable()
export class SubmissionsOrchestrator {
  constructor(
    private readonly createUc: CreateSubmissionUseCase,
    private readonly getMySubmissionUc: GetMySubmissionUseCase,
    private readonly deleteSubmissionUc: DeleteSubmissionUseCase,
    private readonly getSubsByCompUc: GetSubmissionsByCompetitionUseCase,
    private readonly storageOrchestrator: StorageOrchestrator,
  ) {}

  async createSubmission(
    userId: string,
    dto: CreateSubmissionDto,
    file?: Express.Multer.File,
    originalityFile?: Express.Multer.File,
  ): Promise<SubmissionResponseDto> {
    if (!file) throw new BadRequestException('File karya wajib diunggah.');

    const uploadResult = await this.storageOrchestrator.upload(
      file,
      { context: 'submissions' },
      userId,
    );

    let originalityUploadResult = null;
    if (originalityFile) {
      originalityUploadResult = await this.storageOrchestrator.upload(
        originalityFile,
        { context: 'originality' },
        userId,
      );
    }

    return this.createUc.execute(
      userId,
      dto,
      uploadResult.fileUrl,
      uploadResult.storedFileId,
      originalityUploadResult?.fileUrl,
      originalityUploadResult?.storedFileId,
    );
  }

  async deleteSubmission(id: string, userId: string): Promise<void> {
    return this.deleteSubmissionUc.execute(id, userId);
  }

  async getMySubmission(
    registrationId: string,
  ): Promise<SubmissionResponseDto> {
    return this.getMySubmissionUc.execute(registrationId);
  }

  async getSubmissionsByCompetition(
    competitionId: string,
  ): Promise<SubmissionResponseDto[]> {
    return this.getSubsByCompUc.execute(competitionId);
  }
}
