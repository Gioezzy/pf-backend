import { Injectable } from '@nestjs/common';
import { CreateTeamDto } from '../dto/create-team.dto';
import { AddMemberDto } from '../dto/add-member.dto';
import { TeamResponseDto } from '../dto/team-response.dto';
import { CreateTeamUseCase } from '../use-cases/create-team.use-case';
import { AddMemberUseCase } from '../use-cases/add-member.use-case';
import { GetMyTeamUseCase } from '../use-cases/get-my-team.use-case';
import { LeaveTeamUseCase } from '../use-cases/leave-team.use-case';

@Injectable()
export class TeamsOrchestrator {
  constructor(
    private readonly createTeamUc: CreateTeamUseCase,
    private readonly addMemberUc: AddMemberUseCase,
    private readonly getMyTeamUc: GetMyTeamUseCase,
    private readonly leaveTeamUc: LeaveTeamUseCase,
  ) {}

  async createTeam(
    userId: string,
    dto: CreateTeamDto,
  ): Promise<TeamResponseDto> {
    return this.createTeamUc.execute(userId, dto);
  }

  async addMember(userId: string, dto: AddMemberDto): Promise<TeamResponseDto> {
    return this.addMemberUc.execute(userId, dto);
  }

  async getMyTeam(userId: string): Promise<TeamResponseDto> {
    return this.getMyTeamUc.execute(userId);
  }

  async leaveTeam(userId: string): Promise<{ message: string }> {
    return this.leaveTeamUc.execute(userId);
  }
}
