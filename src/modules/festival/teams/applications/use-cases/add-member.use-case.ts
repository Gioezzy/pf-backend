import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AddMemberDto } from '../dto/add-member.dto';
import { TeamResponseDto } from '../dto/team-response.dto';
import {
  type ITeamRepository,
  TEAM_REPOSITORY_TOKEN,
} from '../../infrastructures/repositories/team.repository.interface';
import {
  USER_REPOSITORY_TOKEN,
  type IUserRepository,
} from '../../../../identity/users/infrastructures/repositories/user.repository.interface';
import { TeamDomainService } from '../../domains/services/team-domain.service';
import { TeamMapper } from '../../domains/mappers/team.mapper';

@Injectable()
export class AddMemberUseCase {
  constructor(
    @Inject(TEAM_REPOSITORY_TOKEN)
    private readonly teamRepo: ITeamRepository,
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepo: IUserRepository,
    private readonly domainService: TeamDomainService,
    private readonly mapper: TeamMapper,
  ) {}

  async execute(leaderId: string, dto: AddMemberDto): Promise<TeamResponseDto> {
    // 1. Ambil tim berdasarkan leader
    const team = await this.teamRepo.findByUserId(leaderId);
    if (!team || team.leaderId !== leaderId) {
      throw new ForbiddenException(
        'Hanya ketua tim yang dapat menambahkan anggota.',
      );
    }

    if (!team.id) throw new BadRequestException('Data tim tidak valid');

    // 2. Cari calon anggota
    const newMember = await this.userRepo.findByEmail(dto.email);
    if (!newMember || !newMember.id) {
      throw new NotFoundException(
        `Pengguna dengan email ${dto.email} tidak ditemukan di sistem.`,
      );
    }

    // Mencegah ketua menambahkan dirinya sendiri
    if (newMember.id === leaderId) {
      throw new BadRequestException(
        'Anda tidak perlu menambahkan diri Anda sendiri.',
      );
    }

    // 3. Pastikan calon belum punya tim (Sebagai ketua atau anggota)
    const memberExistingTeam = await this.teamRepo.findByUserId(newMember.id);
    if (memberExistingTeam) {
      throw new BadRequestException(
        'Calon anggota ini sudah tergabung atau menjadi ketua dalam tim lain.',
      );
    }

    // 4. Validasi Domain (Kapasitas & Instansi)
    this.domainService.validateNewMember(team, newMember);

    // 5. Eksekusi
    const memberInstance = this.domainService.createMemberInstance(
      team.id,
      newMember.id,
    );

    if (!team.members) {
      team.members = [];
    }

    team.members.push(memberInstance);

    // 6. Simpan ke database
    const savedTeam = await this.teamRepo.save(team);

    // 7. TARIK ULANG DARI DATABASE AGAR RELASI TERBENTUK (Penting untuk Mapper!)
    const completeTeam = await this.teamRepo.findById(savedTeam.id!);
    if (!completeTeam) {
      throw new InternalServerErrorException(
        'Gagal memuat ulang data tim setelah penambahan anggota.',
      );
    }

    return this.mapper.toResponseDto(completeTeam);
  }
}
