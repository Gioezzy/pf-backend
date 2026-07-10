import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { RegistrationResponseDto } from '../dto/registration-response.dto';
import { ChampionTitle } from '../../domains/entities/registration.entity';
import {
  type IRegistrationRepository,
  REGISTRATION_REPOSITORY_TOKEN,
} from '../../infrastructures/repositories/registration.repository.interface';
import { RegistrationMapper } from '../../domains/mappers/registration.mapper';

@Injectable()
export class SetChampionUseCase {
  constructor(
    @Inject(REGISTRATION_REPOSITORY_TOKEN)
    private readonly regRepo: IRegistrationRepository,
    private readonly mapper: RegistrationMapper,
  ) {}

  async execute(
    registrationId: string,
    title: ChampionTitle,
  ): Promise<RegistrationResponseDto> {
    const registration = await this.regRepo.findById(registrationId);

    if (!registration) {
      throw new NotFoundException('Data pendaftaran tidak ditemukan.');
    }

    registration.championTitle = title;

    const updatedRegistration = await this.regRepo.save(registration);
    return this.mapper.toResponseDto(updatedRegistration);
  }
}
