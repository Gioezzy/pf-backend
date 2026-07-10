import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CompetitionRegistrationEntity,
  RegistrationStatus,
} from '../../../registrations/domains/entities/registration.entity';

@Injectable()
export class SubmissionDomainService {
  validateRegistrationEligibility(
    registration: CompetitionRegistrationEntity,
    userId: string,
  ): void {
    // 1. Cek Status Pembayaran
    if (registration.status !== RegistrationStatus.VERIFIED) {
      throw new BadRequestException(
        'Pendaftaran Anda belum diverifikasi atau belum lunas.',
      );
    }

    // 2. Cek Kepemilikan (Otorisasi)
    const isIndividualOwner = registration.userId === userId;
    const isTeamLeader = registration.team?.leaderId === userId;

    if (!isIndividualOwner && !isTeamLeader) {
      throw new BadRequestException(
        'Hanya peserta individu atau ketua tim yang diizinkan mengunggah karya.',
      );
    }
  }
}
