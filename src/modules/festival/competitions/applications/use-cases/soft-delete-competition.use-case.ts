import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  COMPETITION_REPOSITORY_TOKEN,
  type ICompetitionRepository,
} from '../../infrastructures/repositories/competition.repository.interface';

@Injectable()
export class SoftDeleteCompetitionUseCase {
  constructor(
    @Inject(COMPETITION_REPOSITORY_TOKEN)
    private readonly repo: ICompetitionRepository,
  ) {}

  async execute(id: string): Promise<{ message: string }> {
    const competition = await this.repo.findById(id);
    if (!competition) {
      throw new NotFoundException(`Lomba dengan ID ${id} tidak ditemukan.`);
    }

    // Jika sudah non-aktif, kembalikan response langsung tanpa query database tambahan
    if (!competition.isActive) {
      return {
        message: `Lomba '${competition.name}' sudah dalam keadaan non-aktif.`,
      };
    }

    competition.isActive = false;
    await this.repo.save(competition);

    return {
      message: `Lomba '${competition.name}' berhasil dinonaktifkan (Soft Delete).`,
    };
  }
}
