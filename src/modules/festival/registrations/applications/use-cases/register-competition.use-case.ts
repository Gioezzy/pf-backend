import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { RegisterCompetitionDto } from '../dto/register-competition.dto';
import { RegistrationResponseDto } from '../dto/registration-response.dto';
import {
  type IRegistrationRepository,
  REGISTRATION_REPOSITORY_TOKEN,
} from '../../infrastructures/repositories/registration.repository.interface';
import {
  CompetitionRegistrationEntity,
  RegistrationStatus,
} from '../../domains/entities/registration.entity';
import { RegistrationDomainService } from '../../domains/services/registration-domain.service';
import { RegistrationMapper } from '../../domains/mappers/registration.mapper';
import {
  TEAM_REPOSITORY_TOKEN,
  type ITeamRepository,
} from '../../../teams/infrastructures/repositories/team.repository.interface';
import {
  USER_REPOSITORY_TOKEN,
  type IUserRepository,
} from '../../../../identity/users/infrastructures/repositories/user.repository.interface';
import {
  type ICompetitionRepository,
  COMPETITION_REPOSITORY_TOKEN,
} from '../../../competitions/infrastructures/repositories/competition.repository.interface';
import { CompetitionParticipantType } from '../../../competitions/domains/entities/competition.entity';

@Injectable()
export class RegisterCompetitionUseCase {
  constructor(
    @Inject(REGISTRATION_REPOSITORY_TOKEN)
    private readonly regRepo: IRegistrationRepository,
    @Inject(TEAM_REPOSITORY_TOKEN)
    private readonly teamRepo: ITeamRepository,
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepo: IUserRepository,
    @Inject(COMPETITION_REPOSITORY_TOKEN)
    private readonly competitionRepo: ICompetitionRepository,
    private readonly domainService: RegistrationDomainService,
    private readonly mapper: RegistrationMapper,
  ) {}

  async execute(
    userId: string,
    dto: RegisterCompetitionDto,
  ): Promise<RegistrationResponseDto> {
    // 1. Tarik data lomba (beserta relasi waves-nya)
    if (!userId) {
      throw new BadRequestException(
        'Gagal mendapatkan ID Pengguna. Cek payload token JWT Anda.',
      );
    }

    const competition = await this.competitionRepo.findById(dto.competitionId);
    if (!competition) throw new BadRequestException('Lomba tidak ditemukan.');

    // 2. Cari wave dari array relasi yang sudah ditarik
    const wave = (competition.waves ?? []).find((w) => w.id === dto.waveId);
    if (!wave) {
      throw new BadRequestException(
        'Gelombang tidak ditemukan pada lomba ini.',
      );
    }

    // 3. Validasi Domain (Jadwal & Tipe Lomba)
    this.domainService.validateWaveIsActive(wave);
    this.domainService.validateCompetitionType(competition, dto.teamId);

    const isTeamCompetition =
      competition.participantType === CompetitionParticipantType.TEAM;
    const participantId = isTeamCompetition ? dto.teamId! : userId;

    const isDuplicate = await this.regRepo.checkDuplicate(
      dto.competitionId,
      participantId,
      isTeamCompetition,
    );

    if (isDuplicate) {
      throw new ConflictException(
        'Anda atau tim Anda sudah terdaftar di lomba ini.',
      );
    }

    // =========================================================================
    // 4. VALIDASI KUOTA MAKSIMAL LOMBA (MAKS 3)
    // =========================================================================
    const checkUserQuota = async (targetUserId: string, label: string) => {
      const userRegs = await this.regRepo.findMyRegistrations(targetUserId);
      const activeRegs = userRegs.filter(
        (reg) =>
          reg.status !== RegistrationStatus.CANCELLED &&
          reg.status !== RegistrationStatus.REJECTED,
      );

      if (activeRegs.length >= 3) {
        throw new BadRequestException(
          `Batas maksimal tercapai. ${label} sudah mengikuti maksimal 3 cabang perlombaan.`,
        );
      }
    };

    // Cek kuota untuk user yang melakukan pendaftaran (individu / ketua tim)
    await checkUserQuota(userId, 'Anda');
    // =========================================================================

    const newReg = new CompetitionRegistrationEntity();
    newReg.competitionId = dto.competitionId;
    newReg.waveId = dto.waveId;

    // 5. Validasi Tim dan Kuota Anggota
    if (isTeamCompetition && dto.teamId) {
      const team = await this.teamRepo.findById(dto.teamId);
      if (!team) throw new BadRequestException('Tim tidak ditemukan.');

      if (team.leaderId !== userId) {
        throw new BadRequestException(
          'Hanya ketua tim yang berhak mendaftarkan tim ke lomba.',
        );
      }

      const totalMembers = (team.members?.length || 0) + 1;
      const min = competition.minTeamMembers || 1;
      const max = competition.maxTeamMembers || 3;

      if (totalMembers < min || totalMembers > max) {
        throw new BadRequestException(
          `Lomba ini mensyaratkan ${min} sampai ${max} anggota tim (termasuk ketua). Tim Anda memiliki ${totalMembers} anggota.`,
        );
      }

      // Cek kuota lomba untuk seluruh anggota tim agar tidak ada "selundupan"
      if (team.members && team.members.length > 0) {
        for (const member of team.members) {
          await checkUserQuota(member.userId, 'Salah satu anggota tim Anda');
        }
      }

      newReg.teamId = dto.teamId;
      newReg.userId = null;
    } else {
      newReg.userId = userId;
      newReg.teamId = null;
    }

    // 7. Eksekusi Penyimpanan
    try {
      const savedReg = await this.regRepo.save(newReg);
      if (!savedReg.id) {
        throw new InternalServerErrorException('Gagal menyimpan pendaftaran.');
      }

      const completeReg = await this.regRepo.findById(savedReg.id);
      if (!completeReg) {
        throw new InternalServerErrorException(
          'Gagal memuat data setelah disimpan.',
        );
      }

      return this.mapper.toResponseDto(completeReg);
    } catch (error: unknown) {
      console.error('=== DETAIL ERROR REGISTRASI ===', error);
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const dbError = error as { code: string };
        // Deteksi Unique Constraint Violation (Contoh: PostgreSQL code 23505)
        if (dbError.code === '23505') {
          throw new ConflictException(
            'Anda atau tim Anda sudah terdaftar di lomba ini.',
          );
        }
      }
      throw new InternalServerErrorException(
        'Terjadi kesalahan saat menyimpan pendaftaran lomba.',
      );
    }
  }
}
