import {
  CompetitionRegistrationEntity,
  RegistrationStatus,
} from '../../domains/entities/registration.entity';

export const REGISTRATION_REPOSITORY_TOKEN = 'REGISTRATION_REPOSITORY_TOKEN';

export interface IRegistrationRepository {
  save(
    registration: CompetitionRegistrationEntity,
  ): Promise<CompetitionRegistrationEntity>;

  findById(id: string): Promise<CompetitionRegistrationEntity | null>;

  findByTeamId(teamId: string): Promise<CompetitionRegistrationEntity[]>;

  // Mencari pendaftaran milik user tertentu (baik individu maupun perwakilan tim)
  findMyRegistrations(userId: string): Promise<CompetitionRegistrationEntity[]>;

  checkDuplicate(
    competitionId: string,
    participantId: string,
    isTeam: boolean,
  ): Promise<boolean>;

  findByCompetitionIdAndStatus(
    competitionId: string,
    status: RegistrationStatus,
  ): Promise<CompetitionRegistrationEntity[]>;

  // Untuk antrian verifikasi bendahara (lintas lomba)
  findAllByStatus(
    status: RegistrationStatus,
  ): Promise<CompetitionRegistrationEntity[]>;

  findAllPaymentsForTreasurer(): Promise<CompetitionRegistrationEntity[]>;
}
