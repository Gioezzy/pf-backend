import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SubmissionEntity } from '../entities/submission.entity';
import { SubmissionResponseDto } from '../../applications/dto/submission-response.dto';

@Injectable()
export class SubmissionMapper {
  toResponseDto(entity: SubmissionEntity): SubmissionResponseDto {
    if (!entity.id || !entity.submittedAt) {
      throw new InternalServerErrorException('Data submission korup.');
    }

    const dto = new SubmissionResponseDto();
    dto.id = entity.id;
    dto.registrationId = entity.registrationId;
    dto.title = entity.title;
    dto.description = entity.description;
    dto.fileUrl = entity.fileUrl;
    dto.originalityFileUrl = entity.originalityFileUrl;
    dto.status = entity.status;
    dto.score = entity.score;
    dto.submittedAt = entity.submittedAt;

    if (entity.registration) {
      if (entity.registration.team) {
        dto.teamName = entity.registration.team.name;
        dto.institution = entity.registration.team.institution;
        dto.members = entity.registration.team.members ? entity.registration.team.members.map((m) => ({
          name: m.user ? (m.user.fullName ?? m.user.email) : 'Anggota Tidak Diketahui',
          avatar: m.user ? m.user.avatarUrl : null,
          email: m.user ? m.user.email : null,
          phone: m.user ? m.user.phoneNumber : null,
        })) : [];
        if (entity.registration.team.leader) {
          dto.participantName = entity.registration.team.leader.fullName ?? entity.registration.team.leader.email;
          dto.participantAvatar = entity.registration.team.leader.avatarUrl;
          dto.participantEmail = entity.registration.team.leader.email;
          dto.participantPhone = entity.registration.team.leader.phoneNumber;
        }
      } else if (entity.registration.user) {
        dto.participantName = entity.registration.user.fullName ?? entity.registration.user.email;
        dto.participantAvatar = entity.registration.user.avatarUrl;
        dto.participantEmail = entity.registration.user.email;
        dto.participantPhone = entity.registration.user.phoneNumber;
        dto.institution = entity.registration.user.institution;
        dto.members = [];
      }
    }

    return dto;
  }
}
