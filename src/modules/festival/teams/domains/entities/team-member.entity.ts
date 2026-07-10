// src/festival/teams/domains/entities/team-member.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { UserEntity } from '../../../../identity/users/domains/entities/user.entity';
import type { TeamEntity } from './team.entity';

@Entity('team_members')
@Index('idx_team_members_team_id', ['teamId'])
@Index('uq_team_members_user', ['userId'], { unique: true })
export class TeamMemberEntity {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'uuid' })
  teamId: string = '';

  @ManyToOne('TeamEntity', 'members', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teamId' })
  team?: TeamEntity;

  @Column({ type: 'uuid' })
  userId: string = '';

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: UserEntity;

  @CreateDateColumn()
  joinedAt?: Date;
}
