import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';

import { CompetitionEntity } from '../../../competitions/domains/entities/competition.entity';
import { CompetitionWaveEntity } from '../../../competitions/domains/entities/competition-wave.entity';
import { TeamEntity } from '../../../teams/domains/entities/team.entity';
import { UserEntity } from '../../../../identity/users/domains/entities/user.entity';
import { PaymentAttemptEntity } from './payment-attempt.entity';

export enum RegistrationStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum ChampionTitle {
  NONE = 'NONE',
  JUARA_1 = 'JUARA_1',
  JUARA_2 = 'JUARA_2',
  JUARA_3 = 'JUARA_3',
  HONORABLE_MENTION = 'HONORABLE_MENTION',
}

@Entity({ name: 'competition_registrations' })
@Index('uq_registration_competition_user', ['competitionId', 'userId'], {
  unique: true,
  where: '"userId" IS NOT NULL',
})
@Index('uq_registration_competition_team', ['competitionId', 'teamId'], {
  unique: true,
  where: '"teamId" IS NOT NULL',
})
export class CompetitionRegistrationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToMany(() => PaymentAttemptEntity, (attempt) => attempt.registration, {
    cascade: true,
  })
  paymentAttempts!: PaymentAttemptEntity[];

  @Column({ type: 'uuid' })
  competitionId: string = '';

  @ManyToOne(() => CompetitionEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'competitionId' })
  competition?: CompetitionEntity;

  @Column({ type: 'uuid', nullable: true })
  waveId: string | null = null;

  @ManyToOne(() => CompetitionWaveEntity, {
    onDelete: 'RESTRICT',
    nullable: true,
  })
  @JoinColumn({ name: 'waveId' })
  wave?: CompetitionWaveEntity;

  @Column({ type: 'uuid', nullable: true })
  userId: string | null = null;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: UserEntity;

  @Column({ type: 'uuid', nullable: true })
  teamId: string | null = null;

  @ManyToOne(() => TeamEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'teamId' })
  team?: TeamEntity;

  @Column({
    type: 'enum',
    enum: RegistrationStatus,
    default: RegistrationStatus.PENDING_PAYMENT,
  })
  status: RegistrationStatus = RegistrationStatus.PENDING_PAYMENT;

  @CreateDateColumn()
  registeredAt!: Date;

  @Column({
    type: 'enum',
    enum: ChampionTitle,
    default: ChampionTitle.NONE,
  })
  championTitle: ChampionTitle = ChampionTitle.NONE;
}
