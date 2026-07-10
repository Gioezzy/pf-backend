import { Inject, Injectable } from '@nestjs/common';
import { RegistrationResponseDto } from '../dto/registration-response.dto';
import {
  type IRegistrationRepository,
  REGISTRATION_REPOSITORY_TOKEN,
} from '../../infrastructures/repositories/registration.repository.interface';
import { RegistrationMapper } from '../../domains/mappers/registration.mapper';

@Injectable()
export class GetPendingVerificationsUseCase {
  constructor(
    @Inject(REGISTRATION_REPOSITORY_TOKEN)
    private readonly regRepo: IRegistrationRepository,
    private readonly mapper: RegistrationMapper,
  ) {}

  async execute(): Promise<RegistrationResponseDto[]> {
    const registrations = await this.regRepo.findAllPaymentsForTreasurer();
    return registrations.map((reg) => this.mapper.toResponseDto(reg));
  }
}
