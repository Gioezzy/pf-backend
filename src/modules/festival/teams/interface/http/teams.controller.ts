// src/festival/teams/interface/http/teams.controller.ts
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  Delete,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { TeamsOrchestrator } from '../../applications/orchestrator/teams.orchestrator';
import { CreateTeamDto } from '../../applications/dto/create-team.dto';
import { AddMemberDto } from '../../applications/dto/add-member.dto';
import { TeamResponseDto } from '../../applications/dto/team-response.dto';
import { JwtAuthGuard } from '../../../../identity/auth/interface/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../identity/auth/interface/guards/roles.guard';
import { Roles } from '../../../../identity/auth/interface/decorators/roles.decorator';
import { UserRole } from '../../../../identity/users/domains/entities/user.entity';

// Interface untuk menimpa objek Request dari Express agar Type-Safe
export interface RequestWithUser extends Request {
  user: {
    sub: string;
    email: string;
    role: UserRole;
  };
}

@ApiTags('Festival - Teams')
@ApiBearerAuth('JWT') // Menandakan endpoint ini butuh token di Swagger
@UseGuards(JwtAuthGuard, RolesGuard) // Memastikan hanya user login yang bisa akses
@Controller('teams')
export class TeamsController {
  constructor(private readonly orchestrator: TeamsOrchestrator) {}

  @Post()
  @Roles(UserRole.PARTICIPANT)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Membuat tim baru (User otomatis menjadi ketua)' })
  @ApiCreatedResponse({
    description: 'Tim berhasil dibuat.',
    type: TeamResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'User sudah memiliki tim, belum mengisi instansi, atau nama tim duplikat.',
  })
  async createTeam(
    @Req() req: RequestWithUser,
    @Body() dto: CreateTeamDto,
  ): Promise<TeamResponseDto> {
    const sub = req.user.sub;
    return this.orchestrator.createTeam(sub, dto);
  }

  @Post('members')
  @Roles(UserRole.PARTICIPANT)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Menambah anggota tim baru (Hanya dapat diakses Ketua Tim)',
  })
  @ApiCreatedResponse({
    description: 'Anggota berhasil ditambahkan ke dalam tim.',
    type: TeamResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Kuota tim penuh, anggota sudah memiliki tim, atau instansi berbeda.',
  })
  @ApiForbiddenResponse({
    description: 'Hanya ketua tim yang diizinkan menambahkan anggota.',
  })
  @ApiNotFoundResponse({
    description: 'Email pengguna yang didaftarkan tidak ditemukan di sistem.',
  })
  async addMember(
    @Req() req: RequestWithUser,
    @Body() dto: AddMemberDto,
  ): Promise<TeamResponseDto> {
    const sub = req.user.sub;
    return this.orchestrator.addMember(sub, dto);
  }

  @Get('my-team')
  @Roles(UserRole.PARTICIPANT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mendapatkan informasi tim pengguna saat ini' })
  @ApiOkResponse({
    description: 'Data tim berhasil diambil.',
    type: TeamResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Pengguna saat ini belum tergabung dalam tim manapun.',
  })
  async getMyTeam(@Req() req: RequestWithUser): Promise<TeamResponseDto> {
    const sub = req.user.sub;
    return this.orchestrator.getMyTeam(sub);
  }

  @Delete('my-team')
  @Roles(UserRole.PARTICIPANT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Membubarkan tim (Hanya dapat diakses Ketua Tim)' })
  @ApiOkResponse({
    description: 'Tim berhasil dibubarkan.',
  })
  @ApiBadRequestResponse({
    description: 'Bukan ketua tim, atau tim sudah terdaftar pada perlombaan.',
  })
  async leaveTeam(@Req() req: RequestWithUser): Promise<{ message: string }> {
    const sub = req.user.sub;
    return this.orchestrator.leaveTeam(sub);
  }
}
