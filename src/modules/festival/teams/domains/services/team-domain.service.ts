import { BadRequestException, Injectable } from '@nestjs/common';
import { TeamEntity } from '../entities/team.entity';
import { UserEntity } from '../../../../identity/users/domains/entities/user.entity';
import { TeamMemberEntity } from '../entities/team-member.entity';

@Injectable()
export class TeamDomainService {
  private readonly MAX_TEAM_SIZE = 3;

  validateNewMember(team: TeamEntity, newMemberUser: UserEntity): void {
    // 1. Validasi Kapasitas
    const currentTotalMembers = 1 + (team.members?.length ?? 0); // 1 Ketua + N Anggota
    if (currentTotalMembers >= this.MAX_TEAM_SIZE) {
      throw new BadRequestException(
        'Kapasitas tim sudah penuh (Maksimal 3 orang).',
      );
    }

    // 2. Validasi Instansi
    const memberInstitution = newMemberUser.institution;

    if (!memberInstitution) {
      throw new BadRequestException(
        'Calon anggota belum melengkapi data instansi di profilnya.',
      );
    }

    if (team.institution.toLowerCase() !== memberInstitution.toLowerCase()) {
      throw new BadRequestException(
        `Instansi tidak cocok. Tim ini dari ${team.institution}, sedangkan anggota dari ${memberInstitution}.`,
      );
    }
  }

  createMemberInstance(teamId: string, userId: string): TeamMemberEntity {
    const member = new TeamMemberEntity();
    member.teamId = teamId;
    member.userId = userId;
    return member;
  }
}
