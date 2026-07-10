import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CompetitionRegistrationEntity } from './registration.entity';
import { StoredFileEntity } from '../../../../shared/storage/domains/entities/stored-file.entity';

export enum PaymentAttemptStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity({ name: 'payment_attempts' })
export class PaymentAttemptEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  registrationId!: string;

  @ManyToOne(
    () => CompetitionRegistrationEntity,
    (reg) => reg.paymentAttempts,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'registrationId' })
  registration?: CompetitionRegistrationEntity;

  @Column({ type: 'varchar', length: 255 })
  proofOfPaymentUrl!: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  proofOfPaymentFileId!: string | null;

  @ManyToOne(() => StoredFileEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'proofOfPaymentFileId' })
  proofOfPaymentFile?: StoredFileEntity;

  @Column({
    type: 'enum',
    enum: PaymentAttemptStatus,
    default: PaymentAttemptStatus.PENDING,
  })
  status!: PaymentAttemptStatus;

  @Column({ type: 'text', nullable: true })
  rejectionReason!: string | null;

  @Column({ type: 'varchar', length: 36, nullable: true })
  verifiedBy!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt!: Date | null;

  @CreateDateColumn()
  uploadedAt!: Date;
}
