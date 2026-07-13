import { Injectable } from '@nestjs/common';
import { CreateTeamDto } from '../dto/create-team.dto';
import { AddMemberDto } from '../dto/add-member.dto';
import { TeamResponseDto } from '../dto/team-response.dto';
import { CreateTeamUseCase } from '../use-cases/create-team.use-case';
import { AddMemberUseCase } from '../use-cases/add-member.use-case';
import { GetMyTeamUseCase } from '../use-cases/get-my-team.use-case';
import { LeaveTeamUseCase } from '../use-cases/leave-team.use-case';
import { RemoveMemberUseCase } from '../use-cases/remove-member.use-case';
import { TransferLeadershipUseCase } from '../use-cases/transfer-leadership.use-case';

@Injectable()
export class TeamsOrchestrator {
  constructor(
    private readonly createTeamUc: CreateTeamUseCase,
    private readonly addMemberUc: AddMemberUseCase,
    private readonly getMyTeamUc: GetMyTeamUseCase,
    private readonly leaveTeamUc: LeaveTeamUseCase,
    private readonly removeMemberUc: RemoveMemberUseCase,
    private readonly transferLeadershipUc: TransferLeadershipUseCase,
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

  async removeMember(
    leaderId: string,
    memberId: string,
  ): Promise<TeamResponseDto> {
    return this.removeMemberUc.execute(leaderId, memberId);
  }

  async transferLeadership(
    leaderId: string,
    newLeaderId: string,
  ): Promise<TeamResponseDto> {
    return this.transferLeadershipUc.execute(leaderId, newLeaderId);
  }
}
