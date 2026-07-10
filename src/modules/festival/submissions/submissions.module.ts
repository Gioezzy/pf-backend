import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubmissionEntity } from './domains/entities/submission.entity';
import { SubmissionRepository } from './infrastructures/repositories/submission.repository';
import { SUBMISSION_REPOSITORY_TOKEN } from './infrastructures/repositories/submission.repository.interface';
import { SubmissionMapper } from './domains/mappers/submission.mapper';
import { SubmissionDomainService } from './domains/services/submission-domain.service';

// Use Cases
import { CreateSubmissionUseCase } from './applications/use-cases/create-submission.use-case';
import { GetMySubmissionUseCase } from './applications/use-cases/get-my-submission.use-case';
import { DeleteSubmissionUseCase } from './applications/use-cases/delete-submission.use-case';
import { GetSubmissionsByCompetitionUseCase } from './applications/use-cases/get-submissions-by-competition.use-case';

import { SubmissionsOrchestrator } from './applications/orchestrator/submissions.orchestrator';
import { SubmissionsController } from './interface/http/submissions.controller';
import { RegistrationsModule } from '../registrations/registrations.module';
import { StorageModule } from '../../shared/storage/storage.module';
import { CompetitionsModule } from '../competitions/competitions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubmissionEntity]),
    RegistrationsModule,
    StorageModule, // <-- Berikan akses ke StorageModule
    CompetitionsModule, // <-- Berikan akses ke ICompetitionRepository (validasi requiresSubmission)
  ],
  controllers: [SubmissionsController],
  providers: [
    {
      provide: SUBMISSION_REPOSITORY_TOKEN,
      useClass: SubmissionRepository,
    },
    SubmissionMapper,
    SubmissionDomainService,
    CreateSubmissionUseCase,
    GetMySubmissionUseCase,
    GetSubmissionsByCompetitionUseCase,
    DeleteSubmissionUseCase,
    SubmissionsOrchestrator,
  ],
  exports: [
    SUBMISSION_REPOSITORY_TOKEN,
    SubmissionMapper,
    SubmissionDomainService,
    CreateSubmissionUseCase,
    GetMySubmissionUseCase,
    GetSubmissionsByCompetitionUseCase,
    DeleteSubmissionUseCase,
    SubmissionsOrchestrator,
  ],
})
export class SubmissionsModule {}
