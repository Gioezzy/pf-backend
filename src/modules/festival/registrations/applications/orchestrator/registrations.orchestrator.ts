import { Injectable } from '@nestjs/common';
import { RegisterCompetitionDto } from '../dto/register-competition.dto';
import { RegistrationResponseDto } from '../dto/registration-response.dto';

import { RegisterCompetitionUseCase } from '../use-cases/register-competition.use-case';
import { GetMyRegistrationsUseCase } from '../use-cases/get-my-registrations.use-case';
import { GetCompetitionRegistrationsUseCase } from '../use-cases/get-competition-registrations.use-case';
import { SetChampionUseCase } from '../use-cases/set-champion.use-case';
import { UploadPaymentProofUseCase } from '../use-cases/upload-payment-proof.use-case';
import { VerifyPaymentUseCase } from '../use-cases/verify-payment.use-case';
import { GetPendingVerificationsUseCase } from '../use-cases/get-pending-verifications.use-case';
import { VerifyPaymentDto } from '../dto/verify-payment.dto';
import { ChampionTitle } from '../../domains/entities/registration.entity';

@Injectable()
export class RegistrationsOrchestrator {
  constructor(
    private readonly registerUc: RegisterCompetitionUseCase,
    private readonly getMyRegsUc: GetMyRegistrationsUseCase,
    private readonly getCompetitionRegsUc: GetCompetitionRegistrationsUseCase,
    private readonly setChampionUc: SetChampionUseCase,
    private readonly uploadPaymentProofUc: UploadPaymentProofUseCase,
    private readonly verifyPaymentUc: VerifyPaymentUseCase,
    private readonly getPendingVerificationsUc: GetPendingVerificationsUseCase,
  ) {}

  async register(
    userId: string,
    dto: RegisterCompetitionDto,
  ): Promise<RegistrationResponseDto> {
    return this.registerUc.execute(userId, dto);
  }

  async getMyRegistrations(userId: string): Promise<RegistrationResponseDto[]> {
    return this.getMyRegsUc.execute(userId);
  }

  async getVerifiedRegistrationsByCompetition(
    competitionId: string,
  ): Promise<RegistrationResponseDto[]> {
    return this.getCompetitionRegsUc.execute(competitionId);
  }

  async setChampionTitle(
    registrationId: string,
    title: ChampionTitle,
  ): Promise<RegistrationResponseDto> {
    return this.setChampionUc.execute(registrationId, title);
  }

  async uploadPaymentProof(
    registrationId: string,
    userId: string,
    file: Express.Multer.File | undefined,
  ): Promise<RegistrationResponseDto> {
    return this.uploadPaymentProofUc.execute(registrationId, userId, file);
  }

  async verifyPayment(
    registrationId: string,
    bendaharaUserId: string,
    dto: VerifyPaymentDto,
  ): Promise<RegistrationResponseDto> {
    return this.verifyPaymentUc.execute(registrationId, bendaharaUserId, dto);
  }

  async getPendingVerifications(): Promise<RegistrationResponseDto[]> {
    return this.getPendingVerificationsUc.execute();
  }
}
