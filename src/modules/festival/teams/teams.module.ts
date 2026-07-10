import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { TeamEntity } from './domains/entities/team.entity';
import { TeamMemberEntity } from './domains/entities/team-member.entity';

// Interfaces & Adapters
import { TEAM_REPOSITORY_TOKEN } from './infrastructures/repositories/team.repository.interface';
import { TeamRepository } from './infrastructures/repositories/team.repository';

// Domains & Mappers
import { TeamDomainService } from './domains/services/team-domain.service';
import { TeamMapper } from './domains/mappers/team.mapper';

// Use Cases & Orchestrator
import { CreateTeamUseCase } from './applications/use-cases/create-team.use-case';
import { AddMemberUseCase } from './applications/use-cases/add-member.use-case';
import { GetMyTeamUseCase } from './applications/use-cases/get-my-team.use-case';
import { LeaveTeamUseCase } from './applications/use-cases/leave-team.use-case';
import { TeamsOrchestrator } from './applications/orchestrator/teams.orchestrator';

// Controller
import { TeamsController } from './interface/http/teams.controller';

// Import User Module untuk mendapatkan IUserRepository
import { UserModule } from '../../identity/users/user.module';
import { RegistrationsModule } from '../registrations/registrations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TeamEntity, TeamMemberEntity]),
    UserModule, // Wajib diimport agar token USER_REPOSITORY_TOKEN bisa dibaca
    forwardRef(() => RegistrationsModule),
  ],
  controllers: [TeamsController],
  providers: [
    // Repository
    {
      provide: TEAM_REPOSITORY_TOKEN,
      useClass: TeamRepository,
    },
    // Domain Services
    TeamDomainService,
    TeamMapper,
    // Use Cases
    CreateTeamUseCase,
    AddMemberUseCase,
    GetMyTeamUseCase,
    LeaveTeamUseCase,
    // Orchestrator
    TeamsOrchestrator,
  ],
  exports: [TEAM_REPOSITORY_TOKEN],
})
export class TeamsModule {}
