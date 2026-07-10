import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  COMPETITION_REPOSITORY_TOKEN,
  type ICompetitionRepository,
} from '../../infrastructures/repositories/competition.repository.interface';
import { UpdateCompetitionDto } from '../dto/update-competition.dto';
import { CompetitionMapper } from '../../domains/mappers/competition.mapper';
import { CompetitionResponseDto } from '../dto/competition-response.dto';

@Injectable()
export class UpdateCompetitionUseCase {
  constructor(
    @Inject(COMPETITION_REPOSITORY_TOKEN)
    private readonly repo: ICompetitionRepository,
    private readonly mapper: CompetitionMapper,
  ) {}

  async execute(
    id: string,
    dto: UpdateCompetitionDto,
  ): Promise<CompetitionResponseDto> {
    const competition = await this.repo.findById(id);
    if (!competition) {
      throw new NotFoundException(`Lomba dengan ID ${id} tidak ditemukan.`);
    }

    // Update field dasar
    if (dto.name !== undefined) competition.name = dto.name;
    if (dto.participantType !== undefined)
      competition.participantType = dto.participantType;
    if (dto.minTeamMembers !== undefined)
      competition.minTeamMembers = dto.minTeamMembers;
    if (dto.maxTeamMembers !== undefined)
      competition.maxTeamMembers = dto.maxTeamMembers;
    if (dto.description !== undefined)
      competition.description = dto.description;
    if (dto.isActive !== undefined) competition.isActive = dto.isActive;
    if (dto.requiresSubmission !== undefined)
      competition.requiresSubmission = dto.requiresSubmission;
    if (dto.whatsappGroupUrl !== undefined)
      competition.whatsappGroupUrl = dto.whatsappGroupUrl;

    const updated = await this.repo.save(competition);
    return this.mapper.toResponseDto(updated);
  }
}
