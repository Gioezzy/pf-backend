import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entitas
import { CompetitionEntity } from './domains/entities/competition.entity';
import { CompetitionWaveEntity } from './domains/entities/competition-wave.entity';

// Repositori
import { COMPETITION_REPOSITORY_TOKEN } from './infrastructures/repositories/competition.repository.interface';
import { CompetitionRepository } from './infrastructures/repositories/competition.repository';
// IMPORT REPOSITORI GELOMBANG
import { COMPETITION_WAVE_REPOSITORY_TOKEN } from './infrastructures/repositories/competition-wave.repository.interface';
import { CompetitionWaveRepository } from './infrastructures/repositories/competition-wave.repository';

// Domain Mappers
import { CompetitionMapper } from './domains/mappers/competition.mapper';

// Use Cases
import { GetAllCompetitionsUseCase } from './applications/use-cases/get-all-competitions.use-case';
import { GetCompetitionDetailUseCase } from './applications/use-cases/get-competition-detail.use-case';
import { CreateCompetitionUseCase } from './applications/use-cases/create-competition.use-case';
import { UpdateCompetitionUseCase } from './applications/use-cases/update-competition.use-case';
import { SoftDeleteCompetitionUseCase } from './applications/use-cases/soft-delete-competition.use-case';
import { UpdateWaveUseCase } from './applications/use-cases/update-wave.use-case'; // IMPORT USE CASE BARU
import { ImportCompetitionsUseCase } from './applications/use-cases/import-competitions.use-case';

// Orchestrator & Controller
import { CompetitionsOrchestrator } from './applications/orchestrator/competitions.orchestrator';
import { CompetitionsController } from './interface/http/competitions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CompetitionEntity, CompetitionWaveEntity]),
    CacheModule.register(),
  ],
  controllers: [CompetitionsController],
  providers: [
    // Repositori
    {
      provide: COMPETITION_REPOSITORY_TOKEN,
      useClass: CompetitionRepository,
    },
    {
      provide: COMPETITION_WAVE_REPOSITORY_TOKEN, // TAMBAHKAN INI
      useClass: CompetitionWaveRepository,
    },

    // Domain Mappers
    CompetitionMapper,

    // Use Cases
    GetAllCompetitionsUseCase,
    GetCompetitionDetailUseCase,
    CreateCompetitionUseCase,
    SoftDeleteCompetitionUseCase,
    UpdateCompetitionUseCase,
    UpdateWaveUseCase, // TAMBAHKAN INI
    ImportCompetitionsUseCase,

    // Orchestrators
    CompetitionsOrchestrator,
  ],
  exports: [COMPETITION_REPOSITORY_TOKEN],
})
export class CompetitionsModule {}
