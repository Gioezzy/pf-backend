import { Inject, Injectable } from '@nestjs/common';
import {
  COMPETITION_REPOSITORY_TOKEN,
  type ICompetitionRepository,
} from '../../infrastructures/repositories/competition.repository.interface';
import {
  CompetitionEntity,
  CompetitionParticipantType,
} from '../../domains/entities/competition.entity';
import { CompetitionWaveEntity } from '../../domains/entities/competition-wave.entity';
import {
  CreateCompetitionDto,
  CreateCompetitionWaveDto,
} from '../dto/create-competition.dto';

@Injectable()
export class ImportCompetitionsUseCase {
  constructor(
    @Inject(COMPETITION_REPOSITORY_TOKEN)
    private readonly repo: ICompetitionRepository,
  ) {}

  async execute(
    data: CreateCompetitionDto[],
  ): Promise<{ imported: number; skipped: number }> {
    let imported = 0;
    let skipped = 0;

    for (const item of data) {
      if (!item.name) continue;

      const existing = await this.repo.findByName(item.name);
      if (existing) {
        skipped++;
        continue;
      }

      const entity = new CompetitionEntity();
      entity.name = item.name;
      entity.participantType =
        item.participantType ?? CompetitionParticipantType.INDIVIDUAL;
      entity.minTeamMembers = Number(item.minTeamMembers) || 1;
      entity.maxTeamMembers = Number(item.maxTeamMembers) || 1;
      entity.description = item.description ?? null;
      entity.requiresSubmission = item.requiresSubmission === true;
      entity.isActive = item.isActive === true;
      entity.whatsappGroupUrl = item.whatsappGroupUrl ?? null;

      if (item.waves && Array.isArray(item.waves)) {
        entity.waves = item.waves.map((w: CreateCompetitionWaveDto) => {
          const wave = new CompetitionWaveEntity();
          wave.name = w.name;
          wave.price = Number(w.price) || 0;
          wave.startDate = new Date(w.startDate);
          wave.endDate = new Date(w.endDate);
          return wave;
        });
      }

      await this.repo.save(entity);
      imported++;
    }

    return { imported, skipped };
  }
}
