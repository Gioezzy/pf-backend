import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompetitionWaveEntity } from '../../domains/entities/competition-wave.entity';
import { ICompetitionWaveRepository } from './competition-wave.repository.interface';

@Injectable()
export class CompetitionWaveRepository implements ICompetitionWaveRepository {
  constructor(
    @InjectRepository(CompetitionWaveEntity)
    private readonly ormRepo: Repository<CompetitionWaveEntity>,
  ) {}

  async findById(id: string): Promise<CompetitionWaveEntity | null> {
    return this.ormRepo.findOne({
      where: { id },
    });
  }

  async save(wave: CompetitionWaveEntity): Promise<CompetitionWaveEntity> {
    return this.ormRepo.save(wave);
  }

  async delete(id: string): Promise<void> {
    await this.ormRepo.delete(id);
  }
}
