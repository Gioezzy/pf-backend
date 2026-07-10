import { Inject, Injectable } from '@nestjs/common';
import { RegistrationResponseDto } from '../dto/registration-response.dto';
import {
  type IRegistrationRepository,
  REGISTRATION_REPOSITORY_TOKEN,
} from '../../infrastructures/repositories/registration.repository.interface';
import { RegistrationMapper } from '../../domains/mappers/registration.mapper';

@Injectable()
export class GetMyRegistrationsUseCase {
  constructor(
    @Inject(REGISTRATION_REPOSITORY_TOKEN)
    private readonly regRepo: IRegistrationRepository,
    private readonly mapper: RegistrationMapper,
  ) {}

  async execute(userId: string): Promise<RegistrationResponseDto[]> {
    const registrations = await this.regRepo.findMyRegistrations(userId);

    return registrations.map((reg) => this.mapper.toResponseDto(reg));
  }
}
