// applications/use-cases/get-all-competitions.use-case.ts

import { Inject, Injectable } from '@nestjs/common';
import {
  type ICompetitionRepository,
  COMPETITION_REPOSITORY_TOKEN,
} from '../../infrastructures/repositories/competition.repository.interface';
import { CompetitionMapper } from '../../domains/mappers/competition.mapper';
import { CompetitionResponseDto } from '../dto/competition-response.dto';

@Injectable()
export class GetAllCompetitionsUseCase {
  constructor(
    @Inject(COMPETITION_REPOSITORY_TOKEN)
    private readonly repo: ICompetitionRepository,
    private readonly mapper: CompetitionMapper,
  ) {}

  // Tambahkan parameter includeInactive
  async execute(
    includeInactive: boolean = false,
  ): Promise<CompetitionResponseDto[]> {
    const competitions = await this.repo.findAll(includeInactive);
    return competitions.map((comp) => this.mapper.toResponseDto(comp));
  }
}
