import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompetitionEntity } from '../../domains/entities/competition.entity';
import { type ICompetitionRepository } from './competition.repository.interface';

@Injectable()
export class CompetitionRepository implements ICompetitionRepository {
  constructor(
    @InjectRepository(CompetitionEntity)
    private readonly ormRepo: Repository<CompetitionEntity>,
  ) {}

  async findAll(
    includeInactive: boolean = false,
  ): Promise<CompetitionEntity[]> {
    return this.ormRepo.find({
      where: includeInactive ? {} : { isActive: true },
      relations: {
        waves: true,
      },
      order: { name: 'ASC' },
    });
  }

  async findById(id: string): Promise<CompetitionEntity | null> {
    return this.ormRepo.findOne({
      where: { id },
      relations: {
        waves: true,
      },
    });
  }

  async save(competition: CompetitionEntity): Promise<CompetitionEntity> {
    return this.ormRepo.save(competition);
  }
}
