// src/festival/teams/domains/entities/team.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { UserEntity } from '../../../../identity/users/domains/entities/user.entity';
import { TeamMemberEntity } from './team-member.entity';

@Entity('teams')
@Index('uq_teams_leader', ['leaderId'], { unique: true })
export class TeamEntity {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  // Menggunakan default string kosong. Data asli akan diisi dari DTO saat pembuatan.
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string = '';

  @Column({ type: 'varchar', length: 150 })
  institution: string = '';

  @Column({ type: 'uuid' })
  leaderId: string = '';

  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'leaderId' })
  leader?: UserEntity;

  // Relasi OneToMany bisa menggunakan array kosong sebagai nilai awal yang aman.
  @OneToMany(() => TeamMemberEntity, (member) => member.team, {
    cascade: true,
  })
  members?: TeamMemberEntity[];

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
