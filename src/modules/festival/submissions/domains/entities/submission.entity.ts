import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { CompetitionRegistrationEntity } from '../../../registrations/domains/entities/registration.entity';

export enum SubmissionStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  GRADED = 'GRADED',
}

@Entity('competition_submissions')
@Index('uq_submission_registration', ['registrationId'], { unique: true })
export class SubmissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  registrationId: string = '';

  @OneToOne(() => CompetitionRegistrationEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'registrationId' })
  registration: CompetitionRegistrationEntity | null = null;

  @Column({ type: 'varchar', length: 255 })
  title: string = ''; // Judul karya (misal: "Inovasi Energi Fusi")

  @Column({ type: 'text', nullable: true })
  description: string | null = null; // Deskripsi singkat/abstrak

  @Column({ type: 'varchar', length: 500 })
  fileUrl: string = ''; // Link GDrive atau URL file S3

  @Column({ type: 'varchar', length: 500, nullable: true })
  originalityFileUrl: string | null = null; // Tanda Orisinalitas Karya

  @Column({
    type: 'enum',
    enum: SubmissionStatus,
    default: SubmissionStatus.DRAFT,
  })
  status: SubmissionStatus = SubmissionStatus.DRAFT;

  @Column({ type: 'varchar', length: 36, nullable: true })
  storedFileId: string | null = null;

  @Column({ type: 'varchar', length: 36, nullable: true })
  originalityStoredFileId: string | null = null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  score: number | null = null; // Nilai dari juri (0.00 - 100.00)

  @CreateDateColumn()
  submittedAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
