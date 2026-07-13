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

@Injectable()
export class RemoveMemberUseCase {
  constructor(
    @Inject(TEAM_REPOSITORY_TOKEN)
    private readonly teamRepo: ITeamRepository,
    private readonly mapper: TeamMapper,
  ) {}

  async execute(leaderId: string, memberId: string): Promise<TeamResponseDto> {
    // 1. Ambil tim berdasarkan leader
    const team = await this.teamRepo.findByUserId(leaderId);
    if (!team) {
      throw new BadRequestException('Anda belum tergabung dalam tim manapun.');
    }

    // 2. Pastikan yang menghapus adalah ketua tim
    if (team.leaderId !== leaderId) {
      throw new ForbiddenException(
        'Hanya ketua tim yang dapat mengeluarkan anggota.',
      );
    }

    if (!team.members || team.members.length === 0) {
      throw new BadRequestException('Tim ini belum memiliki anggota.');
    }

    // 3. Pastikan member yang mau dihapus ada di tim ini
    const memberIndex = team.members.findIndex((m) => m.userId === memberId);
    if (memberIndex === -1) {
      throw new BadRequestException('Anggota tersebut tidak ada di dalam tim ini.');
    }

    // 4. Hapus dari array (karena kita akan pakai .save yang akan meng-cascade perubahan ke team_members)
    team.members.splice(memberIndex, 1);

    // 5. Simpan perubahan
    const savedTeam = await this.teamRepo.save(team);

    // 6. Muat ulang untuk Response DTO
    const completeTeam = await this.teamRepo.findById(savedTeam.id!);
    if (!completeTeam) {
      throw new InternalServerErrorException(
        'Gagal memuat ulang data tim setelah anggota dihapus.',
      );
    }

    return this.mapper.toResponseDto(completeTeam);
  }
}
