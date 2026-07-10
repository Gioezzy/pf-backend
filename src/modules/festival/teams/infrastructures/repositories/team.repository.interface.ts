import { TeamEntity } from '../../domains/entities/team.entity';

export const TEAM_REPOSITORY_TOKEN = 'TEAM_REPOSITORY_TOKEN';

export interface ITeamRepository {
  save(team: TeamEntity): Promise<TeamEntity>;
  findById(id: string): Promise<TeamEntity | null>;
  findByUserId(userId: string): Promise<TeamEntity | null>; // Cek apakah user sudah punya tim (sebagai ketua atau anggota)
  findByName(name: string): Promise<TeamEntity | null>;
  delete(id: string): Promise<void>;
}
