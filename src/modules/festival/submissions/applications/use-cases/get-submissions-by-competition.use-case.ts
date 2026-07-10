import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  type ISubmissionRepository,
  SUBMISSION_REPOSITORY_TOKEN,
} from '../../infrastructures/repositories/submission.repository.interface';
import { SubmissionMapper } from '../../domains/mappers/submission.mapper';
import { SubmissionResponseDto } from '../dto/submission-response.dto';
import {
  type ICompetitionRepository,
  COMPETITION_REPOSITORY_TOKEN,
} from '../../../competitions/infrastructures/repositories/competition.repository.interface';

@Injectable()
export class GetSubmissionsByCompetitionUseCase {
  constructor(
    @Inject(SUBMISSION_REPOSITORY_TOKEN)
    private readonly subRepo: ISubmissionRepository,
    @Inject(COMPETITION_REPOSITORY_TOKEN)
    private readonly competitionRepo: ICompetitionRepository,
    private readonly mapper: SubmissionMapper,
  ) {}

  async execute(competitionId: string): Promise<SubmissionResponseDto[]> {
    // 1. Pastikan lomba yang dimaksud benar-benar ada
    const competition = await this.competitionRepo.findById(competitionId);
    if (!competition) {
      throw new NotFoundException('Lomba tidak ditemukan.');
    }

    // 2. Hanya lomba dengan kriteria requiresSubmission yang punya data karya
    if (!competition.requiresSubmission) {
      throw new BadRequestException(
        'Lomba ini tidak memiliki kriteria pengumpulan karya (requiresSubmission).',
      );
    }

    // 3. Ambil seluruh karya yang terkumpul untuk lomba tersebut
    const submissions = await this.subRepo.findByCompetitionId(competitionId);
    return submissions.map((sub) => this.mapper.toResponseDto(sub));
  }
}
