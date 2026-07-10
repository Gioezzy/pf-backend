import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CompetitionEntity } from './competition.entity';

@Entity({ name: 'competition_waves' })
@Index('uq_competition_waves_competition_name', ['competitionId', 'name'], {
  unique: true,
})
export class CompetitionWaveEntity {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'varchar', length: 36, nullable: false })
  competitionId?: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  name: string = ''; // "Gelombang 1", "Gelombang 2"

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  price: number = 0;

  @Column({ type: 'timestamp', nullable: false })
  startDate: Date = new Date();

  @Column({ type: 'timestamp', nullable: false })
  endDate: Date = new Date();

  @ManyToOne(() => CompetitionEntity, (competition) => competition.waves, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'competitionId' })
  competition?: CompetitionEntity;
}
