import { Injectable } from '@nestjs/common';
import { CompetitionEntity } from '../entities/competition.entity';
import { CompetitionWaveEntity } from '../entities/competition-wave.entity';
import {
  CompetitionResponseDto,
  CompetitionWaveDto,
} from '../../applications/dto/competition-response.dto';

@Injectable()
export class CompetitionMapper {
  toWaveDto(wave: CompetitionWaveEntity): CompetitionWaveDto {
    return {
      id: wave.id ?? null,
      name: wave.name,
      price: Number(wave.price),
      startDate: wave.startDate,
      endDate: wave.endDate,
    };
  }

  toResponseDto(entity: CompetitionEntity): CompetitionResponseDto {
    const now = new Date();

    // CARA AMAN: Jika entity.waves undefined, gunakan array kosong []
    const safeWaves = entity.waves ?? [];
    const sortedWaves = [...safeWaves].sort(
      (a, b) => a.startDate.getTime() - b.startDate.getTime(),
    );

    const activeWaveEntity = sortedWaves.find(
      (w) => now >= w.startDate && now <= w.endDate,
    );

    const isOpen = entity.isActive && activeWaveEntity !== undefined;

    return {
      id: entity.id ?? null,
      name: entity.name,
      participantType: entity.participantType,
      minTeamMembers: entity.minTeamMembers,
      maxTeamMembers: entity.maxTeamMembers,
      description: entity.description,
      requiresSubmission: entity.requiresSubmission,
      isActive: entity.isActive,
      isOpen,
      activeWave: activeWaveEntity ? this.toWaveDto(activeWaveEntity) : null,
      waves: sortedWaves.map((w) => this.toWaveDto(w)),
      whatsappGroupUrl: entity.whatsappGroupUrl ?? null,
    };
  }
}
