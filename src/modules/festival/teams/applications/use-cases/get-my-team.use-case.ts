import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TeamResponseDto } from '../dto/team-response.dto';
import {
  type ITeamRepository,
  TEAM_REPOSITORY_TOKEN,
} from '../../infrastructures/repositories/team.repository.interface';
import { TeamMapper } from '../../domains/mappers/team.mapper';

@Injectable()
export class GetMyTeamUseCase {
  constructor(
    @Inject(TEAM_REPOSITORY_TOKEN)
    private readonly teamRepo: ITeamRepository,
    private readonly mapper: TeamMapper,
  ) {}

  async execute(userId: string): Promise<TeamResponseDto> {
    const team = await this.teamRepo.findByUserId(userId);
    if (!team) {
      throw new NotFoundException('Anda belum tergabung dalam tim manapun.');
    }

    return this.mapper.toResponseDto(team);
  }
}
