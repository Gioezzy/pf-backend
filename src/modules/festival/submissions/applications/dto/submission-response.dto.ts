import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubmissionStatus } from '../../domains/entities/submission.entity';
import { TeamMemberDto } from '../../../registrations/applications/dto/registration-response.dto';

export class SubmissionResponseDto {
  @ApiProperty() id: string = '';
  @ApiProperty() registrationId: string = '';
  @ApiProperty() title: string = '';
  @ApiPropertyOptional() description: string | null = null;
  @ApiProperty()
  fileUrl: string = '';

  @ApiPropertyOptional()
  originalityFileUrl: string | null = null;
  @ApiProperty({ enum: SubmissionStatus }) status: SubmissionStatus =
    SubmissionStatus.DRAFT;
  @ApiPropertyOptional() score: number | null = null;
  @ApiProperty() submittedAt: Date = new Date();

  // Extra fields from relations for display
  @ApiPropertyOptional() participantName?: string;
  @ApiPropertyOptional() participantAvatar?: string | null;
  @ApiPropertyOptional() participantPhone?: string | null;
  @ApiPropertyOptional() teamName?: string;
  @ApiPropertyOptional() participantEmail?: string;
  @ApiPropertyOptional() institution?: string | null;
  @ApiPropertyOptional({ type: [TeamMemberDto] }) members?: TeamMemberDto[];
}
