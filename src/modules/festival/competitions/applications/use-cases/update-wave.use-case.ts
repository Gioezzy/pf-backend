import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  COMPETITION_WAVE_REPOSITORY_TOKEN,
  type ICompetitionWaveRepository,
} from '../../infrastructures/repositories/competition-wave.repository.interface';
import { UpdateWaveDto } from '../dto/update-wave.dto';
import { CompetitionMapper } from '../../domains/mappers/competition.mapper';
import { CompetitionWaveDto } from '../dto/competition-response.dto';

@Injectable()
export class UpdateWaveUseCase {
  constructor(
    @Inject(COMPETITION_WAVE_REPOSITORY_TOKEN)
    private readonly waveRepo: ICompetitionWaveRepository,
    private readonly mapper: CompetitionMapper,
  ) {}

  async execute(id: string, dto: UpdateWaveDto): Promise<CompetitionWaveDto> {
    const wave = await this.waveRepo.findById(id);
    if (!wave) {
      throw new NotFoundException(`Gelombang dengan ID ${id} tidak ditemukan.`);
    }

    // Update field yang ada nilainya saja (partial update)
    if (dto.name !== undefined) wave.name = dto.name;
    if (dto.price !== undefined) wave.price = dto.price;
    if (dto.startDate !== undefined) wave.startDate = dto.startDate;
    if (dto.endDate !== undefined) wave.endDate = dto.endDate;

    const updated = await this.waveRepo.save(wave);

    return this.mapper.toWaveDto(updated);
  }
}
