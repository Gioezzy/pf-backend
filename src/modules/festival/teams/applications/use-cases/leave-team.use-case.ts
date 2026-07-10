import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import {
  TEAM_REPOSITORY_TOKEN,
  type ITeamRepository,
} from '../../infrastructures/repositories/team.repository.interface';
import {
  REGISTRATION_REPOSITORY_TOKEN,
  type IRegistrationRepository,
} from '../../../registrations/infrastructures/repositories/registration.repository.interface';

@Injectable()
export class LeaveTeamUseCase {
  constructor(
    @Inject(TEAM_REPOSITORY_TOKEN)
    private readonly teamRepo: ITeamRepository,
    @Inject(REGISTRATION_REPOSITORY_TOKEN)
    private readonly regRepo: IRegistrationRepository,
  ) {}

  async execute(userId: string): Promise<{ message: string }> {
    const team = await this.teamRepo.findByUserId(userId);
    if (!team) {
      throw new BadRequestException('Anda belum tergabung dalam tim manapun.');
    }

    if (team.leaderId !== userId) {
      throw new BadRequestException(
        'Hanya ketua tim yang dapat membubarkan/meninggalkan tim.',
      );
    }

    const regs = await this.regRepo.findByTeamId(team.id!);
    if (regs && regs.length > 0) {
      throw new BadRequestException(
        'Tim tidak dapat dibubarkan karena sudah terdaftar di perlombaan.',
      );
    }

    await this.teamRepo.delete(team.id!);

    return {
      message:
        'Berhasil membatalkan status sebagai ketua tim. Tim telah dibubarkan.',
    };
  }
}
