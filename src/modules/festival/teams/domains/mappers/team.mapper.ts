import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { TeamEntity } from '../entities/team.entity';
import {
  TeamResponseDto,
  TeamMemberDto,
} from '../../applications/dto/team-response.dto';

@Injectable()
export class TeamMapper {
  toResponseDto(entity: TeamEntity): TeamResponseDto {
    if (!entity.id || !entity.createdAt) {
      throw new InternalServerErrorException(
        'Data tim tidak valid (ID/CreatedAt null)',
      );
    }

    const dto = new TeamResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.institution = entity.institution;
    dto.createdAt = entity.createdAt;

    if (entity.leader) {
      dto.leader = {
        id: entity.leader.id,
        fullName: entity.leader.fullName ?? 'Tanpa Nama',
        email: entity.leader.email,
        avatarUrl: entity.leader.avatarUrl,
      };
    }

    dto.members = (entity.members ?? []).map((m) => {
      if (!m.id || !m.joinedAt || !m.user) {
        throw new InternalServerErrorException('Data anggota tim tidak valid');
      }

      const memberDto = new TeamMemberDto();
      memberDto.id = m.id;
      memberDto.userId = m.userId;
      memberDto.fullName = m.user.fullName ?? 'Tanpa Nama';
      memberDto.joinedAt = m.joinedAt;
      memberDto.avatarUrl = m.user.avatarUrl;

      return memberDto;
    });

    return dto;
  }
}
