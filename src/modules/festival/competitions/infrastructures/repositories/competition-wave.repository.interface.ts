import { CompetitionWaveEntity } from '../../domains/entities/competition-wave.entity';

export interface ICompetitionWaveRepository {
  findById(id: string): Promise<CompetitionWaveEntity | null>;

  save(wave: CompetitionWaveEntity): Promise<CompetitionWaveEntity>;
  delete(id: string): Promise<void>;
}

export const COMPETITION_WAVE_REPOSITORY_TOKEN = Symbol(
  'ICompetitionWaveRepository',
);
