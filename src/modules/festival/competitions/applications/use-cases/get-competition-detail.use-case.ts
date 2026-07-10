import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  type ICompetitionRepository,
  COMPETITION_REPOSITORY_TOKEN,
} from '../../infrastructures/repositories/competition.repository.interface';
import { CompetitionMapper } from '../../domains/mappers/competition.mapper';
import { CompetitionResponseDto } from '../dto/competition-response.dto';

@Injectable()
export class GetCompetitionDetailUseCase {
  constructor(
    @Inject(COMPETITION_REPOSITORY_TOKEN)
    private readonly repo: ICompetitionRepository,
    private readonly mapper: CompetitionMapper,
  ) {}

  async execute(id: string): Promise<CompetitionResponseDto> {
    const competition = await this.repo.findById(id);
    if (!competition) {
      throw new NotFoundException(`Lomba dengan ID ${id} tidak ditemukan.`);
    }
    return this.mapper.toResponseDto(competition);
  }
}
