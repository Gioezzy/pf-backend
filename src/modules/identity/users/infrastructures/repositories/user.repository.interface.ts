// src/users/infrastructures/repositories/user.repository.interface.ts
import { UserEntity } from '../../domains/entities/user.entity';

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByIdWithPassword(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findComitteByEmail(email: string): Promise<UserEntity | null>;
  save(user: UserEntity): Promise<UserEntity>;
  findAll(): Promise<UserEntity[]>;
  create(user: Partial<UserEntity>): Promise<UserEntity>;
  update(id: string, data: Partial<UserEntity>): Promise<UserEntity>;
  softDelete(id: string): Promise<void>;
  existsByEmail(email: string): Promise<boolean>;
  searchParticipants(query: string): Promise<UserEntity[]>;
}

export const USER_REPOSITORY_TOKEN = Symbol('IUserRepository');
