import { Injectable } from '@nestjs/common';
import { GetAllCompetitionsUseCase } from '../use-cases/get-all-competitions.use-case';
import { GetCompetitionDetailUseCase } from '../use-cases/get-competition-detail.use-case';
import { CreateCompetitionUseCase } from '../use-cases/create-competition.use-case';
import { UpdateCompetitionUseCase } from '../use-cases/update-competition.use-case';
import { SoftDeleteCompetitionUseCase } from '../use-cases/soft-delete-competition.use-case';
import { UpdateWaveUseCase } from '../use-cases/update-wave.use-case';
import { ImportCompetitionsUseCase } from '../use-cases/import-competitions.use-case';
import {
  CompetitionResponseDto,
  CompetitionWaveDto,
} from '../dto/competition-response.dto';
import { CreateCompetitionDto } from '../dto/create-competition.dto';
import { UpdateCompetitionDto } from '../dto/update-competition.dto';
import { UpdateWaveDto } from '../dto/update-wave.dto';

@Injectable()
export class CompetitionsOrchestrator {
  constructor(
    private readonly getAllUseCase: GetAllCompetitionsUseCase,
    private readonly getDetailUseCase: GetCompetitionDetailUseCase,
    private readonly createUseCase: CreateCompetitionUseCase,
    private readonly updateUseCase: UpdateCompetitionUseCase,
    private readonly softDeleteUseCase: SoftDeleteCompetitionUseCase,
    private readonly updateWaveUseCase: UpdateWaveUseCase,
    private readonly importUseCase: ImportCompetitionsUseCase,
  ) {}

  async getAll(
    includeInactive: boolean = false,
  ): Promise<CompetitionResponseDto[]> {
    return this.getAllUseCase.execute(includeInactive);
  }

  async getDetail(id: string): Promise<CompetitionResponseDto> {
    return this.getDetailUseCase.execute(id);
  }

  async create(dto: CreateCompetitionDto) {
    return this.createUseCase.execute(dto);
  }

  async update(id: string, dto: UpdateCompetitionDto) {
    return this.updateUseCase.execute(id, dto);
  }

  async softDelete(id: string): Promise<{ message: string }> {
    return this.softDeleteUseCase.execute(id);
  }

  async updateWave(
    id: string,
    dto: UpdateWaveDto,
  ): Promise<CompetitionWaveDto> {
    return this.updateWaveUseCase.execute(id, dto);
  }

  async importCompetitions(
    data: CreateCompetitionDto[],
  ): Promise<{ imported: number; skipped: number }> {
    return this.importUseCase.execute(data);
  }
}
