import { Inject, Injectable } from '@nestjs/common';
import {
  USER_REPOSITORY_TOKEN,
  type IUserRepository,
} from '../../infrastructures/repositories/user.repository.interface';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserMapper } from '../../domains/mappers/user.mapper';

@Injectable()
export class SearchParticipantsUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepo: IUserRepository,
    private readonly userMapper: UserMapper,
  ) {}

  async execute(query: string): Promise<UserResponseDto[]> {
    if (!query || query.trim().length < 3) return [];
    const users = await this.userRepo.searchParticipants(query.trim());
    return users.map((u) => this.userMapper.toResponseDto(u));
  }
}
