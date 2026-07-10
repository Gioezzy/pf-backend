import {
  Injectable,
  BadRequestException,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateTeamDto } from '../dto/create-team.dto';
import { TeamResponseDto } from '../dto/team-response.dto';
import {
  type ITeamRepository,
  TEAM_REPOSITORY_TOKEN,
} from '../../infrastructures/repositories/team.repository.interface';
import { TeamEntity } from '../../domains/entities/team.entity';
import { TeamMapper } from '../../domains/mappers/team.mapper';
import {
  USER_REPOSITORY_TOKEN,
  type IUserRepository,
} from '../../../../identity/users/infrastructures/repositories/user.repository.interface';
import { isDuplicateKeyError } from '../../../../shared/utils/database-error.util';

@Injectable()
export class CreateTeamUseCase {
  constructor(
    @Inject(TEAM_REPOSITORY_TOKEN) private readonly teamRepo: ITeamRepository,
    @Inject(USER_REPOSITORY_TOKEN) private readonly userRepo: IUserRepository,
    private readonly mapper: TeamMapper,
  ) {}
  async execute(
    leaderId: string,
    dto: CreateTeamDto,
  ): Promise<TeamResponseDto> {
    console.log('leaderId:', leaderId);
    const leader = await this.userRepo.findById(leaderId);
    console.log('leader found:', leader);
    if (!leader) {
      throw new BadRequestException('Data user tidak valid.');
    }
    const institution = leader.institution;
    if (!institution) {
      throw new BadRequestException(
        'Anda harus melengkapi profil (asal sekolah/instansi) sebelum membuat tim.',
      );
    }
    const existingTeam = await this.teamRepo.findByUserId(leaderId);
    if (existingTeam) {
      throw new BadRequestException('Anda sudah tergabung dalam sebuah tim.');
    }
    const nameTaken = await this.teamRepo.findByName(dto.name);
    if (nameTaken) {
      throw new BadRequestException('Nama tim ini sudah digunakan.');
    }
    const team = new TeamEntity();
    team.name = dto.name;
    team.institution = institution;
    team.leaderId = leaderId;
    let savedTeam: TeamEntity;
    try {
      savedTeam = await this.teamRepo.save(team);
    } catch (err) {
      if (isDuplicateKeyError(err)) {
        throw new BadRequestException(
          'Anda sudah tergabung dalam sebuah tim, atau nama tim ini sudah digunakan.',
        );
      }
      throw err;
    }
    if (!savedTeam.id) {
      throw new InternalServerErrorException(
        'Terjadi kesalahan, gagal mendapatkan ID tim setelah disimpan.',
      );
    }
    const completeTeam = await this.teamRepo.findById(savedTeam.id);
    if (!completeTeam) {
      throw new InternalServerErrorException(
        'Terjadi kesalahan saat memuat ulang data tim.',
      );
    }
    return this.mapper.toResponseDto(completeTeam);
  }
}
