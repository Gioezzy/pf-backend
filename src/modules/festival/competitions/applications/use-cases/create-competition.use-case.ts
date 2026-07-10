import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  COMPETITION_REPOSITORY_TOKEN,
  type ICompetitionRepository,
} from '../../infrastructures/repositories/competition.repository.interface';
import { CreateCompetitionDto } from '../dto/create-competition.dto';
import { CompetitionEntity } from '../../domains/entities/competition.entity';
import { CompetitionWaveEntity } from '../../domains/entities/competition-wave.entity';
import { CompetitionMapper } from '../../domains/mappers/competition.mapper';
import { CompetitionResponseDto } from '../dto/competition-response.dto';

@Injectable()
export class CreateCompetitionUseCase {
  constructor(
    @Inject(COMPETITION_REPOSITORY_TOKEN)
    private readonly repo: ICompetitionRepository,
    private readonly mapper: CompetitionMapper,
  ) {}

  async execute(dto: CreateCompetitionDto): Promise<CompetitionResponseDto> {
    const entity = new CompetitionEntity();
    entity.name = dto.name;
    entity.participantType = dto.participantType;
    entity.minTeamMembers = dto.minTeamMembers;
    entity.maxTeamMembers = dto.maxTeamMembers;
    entity.description = dto.description ?? null;
    entity.requiresSubmission = dto.requiresSubmission ?? false;
    entity.whatsappGroupUrl = dto.whatsappGroupUrl ?? null;

    if (dto.waves && dto.waves.length > 0) {
      entity.waves = dto.waves.map((w) => {
        const wave = new CompetitionWaveEntity();
        wave.name = w.name;
        wave.price = w.price;
        wave.startDate = w.startDate;
        wave.endDate = w.endDate;
        return wave;
      });
    }

    const saved = await this.repo.save(entity);
    if (!saved.id)
      throw new InternalServerErrorException('Gagal menyimpan lomba.');

    return this.mapper.toResponseDto(saved);
  }
}
