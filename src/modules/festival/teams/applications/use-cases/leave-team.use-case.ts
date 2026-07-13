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

    const regs = await this.regRepo.findByTeamId(team.id!);
    if (regs && regs.length > 0) {
      throw new BadRequestException(
        'Tim tidak dapat dibubarkan/ditinggalkan karena sudah terdaftar di perlombaan.',
      );
    }

    if (team.leaderId === userId) {
      // Ketua tim keluar -> Bubarkan tim
      await this.teamRepo.delete(team.id!);
      return {
        message: 'Berhasil membatalkan status sebagai ketua tim. Tim telah dibubarkan.',
      };
    } else {
      // Anggota tim keluar
      const memberIndex = team.members?.findIndex((m) => m.userId === userId) ?? -1;
      if (memberIndex !== -1 && team.members) {
        team.members.splice(memberIndex, 1);
        await this.teamRepo.save(team);
      }
      return {
        message: 'Berhasil keluar dari tim.',
      };
    }
  }
}
