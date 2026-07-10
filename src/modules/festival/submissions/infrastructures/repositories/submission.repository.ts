import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubmissionEntity } from '../../domains/entities/submission.entity';
import type { ISubmissionRepository } from './submission.repository.interface';

@Injectable()
export class SubmissionRepository implements ISubmissionRepository {
  constructor(
    @InjectRepository(SubmissionEntity)
    private readonly repo: Repository<SubmissionEntity>,
  ) {}

  async save(submission: SubmissionEntity): Promise<SubmissionEntity> {
    return this.repo.save(submission);
  }

  async findById(id: string): Promise<SubmissionEntity | null> {
    return this.repo.findOne({
      where: { id },
      relations: { registration: true },
    });
  }

  async findByRegistrationId(
    registrationId: string,
  ): Promise<SubmissionEntity | null> {
    return this.repo.findOne({
      where: { registrationId },
      relations: { registration: true },
    });
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async findByCompetitionId(
    competitionId: string,
  ): Promise<SubmissionEntity[]> {
    return this.repo.find({
      where: { registration: { competitionId } },
      relations: { 
        registration: { 
          user: true, 
          team: {
            leader: true,
            members: {
              user: true
            }
          } 
        } 
      }, // Tarik data peserta juga
    });
  }
}
