import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserMapper } from '../../domains/mappers/user.mapper';
import {
  type IUserRepository,
  USER_REPOSITORY_TOKEN,
} from '../../infrastructures/repositories/user.repository.interface';

@Injectable()
export class GetInstitutionPeersUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepo: IUserRepository,
    private readonly mapper: UserMapper,
  ) {}

  async execute(userId: string): Promise<UserResponseDto[]> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('User tidak ditemukan.');
    }

    // Jika user tidak memiliki NPSN atau institusi, kembalikan array kosong
    if (!user.npsn && !user.institution) {
      return [];
    }

    const peers = await this.userRepo.findInstitutionPeers(
      userId,
      user.npsn,
      user.institution,
    );
    return this.mapper.toResponseDtoList(peers);
  }
}
