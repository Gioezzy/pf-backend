import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamEntity } from '../../domains/entities/team.entity';
import type { ITeamRepository } from './team.repository.interface';

@Injectable()
export class TeamRepository implements ITeamRepository {
  constructor(
    @InjectRepository(TeamEntity)
    private readonly repo: Repository<TeamEntity>,
  ) {}

  async save(team: TeamEntity): Promise<TeamEntity> {
    return this.repo.save(team);
  }

  async findById(id: string): Promise<TeamEntity | null> {
    return this.repo.findOne({
      where: { id },
      relations: {
        leader: true,
        members: {
          user: true,
        },
      },
    });
  }

  async findByName(name: string): Promise<TeamEntity | null> {
    return this.repo.findOne({ where: { name } });
  }

  async findByUserId(userId: string): Promise<TeamEntity | null> {
    const match = await this.repo
      .createQueryBuilder('team')
      .leftJoin('team.members', 'members')
      .where('team.leaderId = :userId', { userId })
      .orWhere('members.userId = :userId', { userId })
      .getOne();

    if (!match?.id) {
      return null;
    }

    return this.findById(match.id);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
