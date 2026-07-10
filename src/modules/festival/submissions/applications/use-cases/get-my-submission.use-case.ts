import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SubmissionResponseDto } from '../dto/submission-response.dto';
import {
  type ISubmissionRepository,
  SUBMISSION_REPOSITORY_TOKEN,
} from '../../infrastructures/repositories/submission.repository.interface';
import { SubmissionMapper } from '../../domains/mappers/submission.mapper';

@Injectable()
export class GetMySubmissionUseCase {
  constructor(
    @Inject(SUBMISSION_REPOSITORY_TOKEN)
    private readonly subRepo: ISubmissionRepository,
    private readonly mapper: SubmissionMapper,
  ) {}

  async execute(registrationId: string): Promise<SubmissionResponseDto> {
    const submission = await this.subRepo.findByRegistrationId(registrationId);

    if (!submission) {
      throw new NotFoundException(
        'Anda belum mengunggah karya untuk pendaftaran ini.',
      );
    }

    return this.mapper.toResponseDto(submission);
  }
}
