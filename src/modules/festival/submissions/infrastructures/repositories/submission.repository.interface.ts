import { SubmissionEntity } from '../../domains/entities/submission.entity';

export const SUBMISSION_REPOSITORY_TOKEN = 'SUBMISSION_REPOSITORY_TOKEN';

export interface ISubmissionRepository {
  save(submission: SubmissionEntity): Promise<SubmissionEntity>;
  findById(id: string): Promise<SubmissionEntity | null>;
  findByRegistrationId(
    registrationId: string,
  ): Promise<SubmissionEntity | null>;
  delete(id: string): Promise<void>;
  findByCompetitionId(competitionId: string): Promise<SubmissionEntity[]>;
}
