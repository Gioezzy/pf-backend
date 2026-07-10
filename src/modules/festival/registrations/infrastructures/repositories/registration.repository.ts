import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CompetitionRegistrationEntity,
  RegistrationStatus,
} from '../../domains/entities/registration.entity';
import type { IRegistrationRepository } from './registration.repository.interface';

@Injectable()
export class RegistrationRepository implements IRegistrationRepository {
  constructor(
    @InjectRepository(CompetitionRegistrationEntity)
    private readonly repo: Repository<CompetitionRegistrationEntity>,
  ) {}

  async save(
    registration: CompetitionRegistrationEntity,
  ): Promise<CompetitionRegistrationEntity> {
    return this.repo.save(registration);
  }

  async findById(id: string): Promise<CompetitionRegistrationEntity | null> {
    return this.repo.findOne({
      where: { id: id },
      relations: {
        competition: true,
        wave: true,
        team: {
          leader: true,
          members: { user: true },
        },
        user: true,
        paymentAttempts: {
          proofOfPaymentFile: true,
        },
      },
    });
  }

  async findByTeamId(teamId: string): Promise<CompetitionRegistrationEntity[]> {
    return this.repo.find({ where: { teamId: teamId } });
  }

  async findMyRegistrations(
    userId: string,
  ): Promise<CompetitionRegistrationEntity[]> {
    return this.repo
      .createQueryBuilder('reg')
      .leftJoinAndSelect('reg.competition', 'competition')
      .leftJoinAndSelect('reg.wave', 'wave')
      .leftJoinAndSelect('reg.team', 'team')
      .leftJoinAndSelect('team.leader', 'leader')
      .leftJoinAndSelect('reg.user', 'user')
      .leftJoinAndSelect('reg.paymentAttempts', 'paymentAttempts')
      .leftJoin('team.members', 'members')
      .where('reg.userId = :userId', { userId })
      .orWhere('team.leaderId = :userId', { userId })
      .orWhere('members.userId = :userId', { userId })
      .getMany();
  }

  async checkDuplicate(
    competitionId: string,
    participantId: string,
    isTeam: boolean,
  ): Promise<boolean> {
    const whereClause = isTeam
      ? { competitionId: competitionId, teamId: participantId }
      : { competitionId: competitionId, userId: participantId };

    const existing = await this.repo.findOne({ where: whereClause });
    return !!existing;
  }

  async findByCompetitionIdAndStatus(
    competitionId: string,
    status: RegistrationStatus,
  ): Promise<CompetitionRegistrationEntity[]> {
    return this.repo.find({
      where: { competitionId, status },
      relations: {
        competition: true,
        wave: true,
        team: {
          leader: true,
          members: { user: true },
        },
        user: true,
      },
    });
  }

  async findAllByStatus(
    status: RegistrationStatus,
  ): Promise<CompetitionRegistrationEntity[]> {
    return this.repo.find({
      where: { status },
      relations: {
        competition: true,
        wave: true,
        team: {
          leader: true,
          members: { user: true },
        },
        user: true,
        paymentAttempts: {
          proofOfPaymentFile: true,
        },
      },
      order: { registeredAt: 'ASC' },
    });
  }

  async findAllPaymentsForTreasurer(): Promise<
    CompetitionRegistrationEntity[]
  > {
    return this.repo
      .createQueryBuilder('reg')
      .leftJoinAndSelect('reg.competition', 'competition')
      .leftJoinAndSelect('reg.wave', 'wave')
      .leftJoinAndSelect('reg.team', 'team')
      .leftJoinAndSelect('team.leader', 'leader')
      .leftJoinAndSelect('reg.user', 'user')
      .leftJoinAndSelect('team.members', 'members')
      .leftJoinAndSelect('members.user', 'memberUser')
      .leftJoinAndSelect('reg.paymentAttempts', 'paymentAttempts')
      .where('reg.status IN (:...statuses)', {
        statuses: [
          RegistrationStatus.PENDING_VERIFICATION,
          RegistrationStatus.VERIFIED,
          RegistrationStatus.REJECTED,
        ],
      })
      .orderBy('paymentAttempts.uploadedAt', 'DESC')
      .getMany();
  }
}
