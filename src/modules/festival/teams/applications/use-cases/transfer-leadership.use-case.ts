import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { TeamResponseDto } from '../dto/team-response.dto';
import {
  type ITeamRepository,
  TEAM_REPOSITORY_TOKEN,
} from '../../infrastructures/repositories/team.repository.interface';
import { TeamMapper } from '../../domains/mappers/team.mapper';
import { TeamMemberEntity } from '../../domains/entities/team-member.entity';

@Injectable()
export class TransferLeadershipUseCase {
  constructor(
    @Inject(TEAM_REPOSITORY_TOKEN)
    private readonly teamRepo: ITeamRepository,
    private readonly mapper: TeamMapper,
  ) {}

  async execute(leaderId: string, newLeaderId: string): Promise<TeamResponseDto> {
    const team = await this.teamRepo.findByUserId(leaderId);
    if (!team) {
      throw new BadRequestException('Anda belum tergabung dalam tim manapun.');
    }

    if (team.leaderId !== leaderId) {
      throw new ForbiddenException(
        'Hanya ketua tim yang dapat memindahkan kepemimpinan.',
      );
    }

    if (!team.members || team.members.length === 0) {
      throw new BadRequestException('Tim ini belum memiliki anggota.');
    }

    const memberIndex = team.members.findIndex((m) => m.userId === newLeaderId);
    if (memberIndex === -1) {
      throw new BadRequestException('Calon ketua baru tidak ada di dalam tim ini.');
    }

    // 1. Dapatkan user entitas dari calon ketua baru
    const newLeaderUser = team.members[memberIndex].user;

    // 2. Jadikan leader lama sebagai member (timpa member yang sudah ada untuk swap aman)
    team.members[memberIndex].userId = leaderId;
    team.members[memberIndex].user = team.leader;
    
    // 3. Set leader baru
    team.leaderId = newLeaderId;
    team.leader = newLeaderUser;

    const savedTeam = await this.teamRepo.save(team);

    const completeTeam = await this.teamRepo.findById(savedTeam.id!);
    if (!completeTeam) {
      throw new InternalServerErrorException(
        'Gagal memuat ulang data tim setelah pemindahan kepemimpinan.',
      );
    }

    return this.mapper.toResponseDto(completeTeam);
  }
}
