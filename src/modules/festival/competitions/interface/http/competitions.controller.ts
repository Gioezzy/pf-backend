import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  ParseArrayPipe,
  UseInterceptors,
  UseGuards,
  Inject,
} from '@nestjs/common';
import {
  CacheInterceptor,
  CacheTTL,
  CacheKey, // 1. TAMBAHKAN IMPORT INI
  CACHE_MANAGER,
} from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiParam,
  ApiBearerAuth,
  ApiCreatedResponse,
} from '@nestjs/swagger';

import { CompetitionsOrchestrator } from '../../applications/orchestrator/competitions.orchestrator';
import {
  CompetitionResponseDto,
  CompetitionWaveDto,
} from '../../applications/dto/competition-response.dto';
import { CreateCompetitionDto } from '../../applications/dto/create-competition.dto';
import { UpdateCompetitionDto } from '../../applications/dto/update-competition.dto';
import { UpdateWaveDto } from '../../applications/dto/update-wave.dto';

import { JwtAuthGuard } from '../../../../identity/auth/interface/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../identity/auth/interface/guards/roles.guard';
import { Roles } from '../../../../identity/auth/interface/decorators/roles.decorator';
import { Public } from '../../../../identity/auth/interface/decorators/public.decorator';
import { UserRole } from '../../../../identity/users/domains/entities/user.entity';

@ApiTags('Competitions')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('competitions')
// 2. PASTIKAN @UseInterceptors(CacheInterceptor) DIHAPUS DARI SINI
export class CompetitionsController {
  constructor(
    private readonly orchestrator: CompetitionsOrchestrator,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Fungsi pamungkas untuk membersihkan cache dengan Kunci Statis
   */
  private async invalidateCache(id?: string): Promise<void> {
    // Menghapus cache utama berdasarkan kunci statis yang pasti cocok
    await this.cacheManager.del('COMPETITIONS_LIST_CACHE');

    // Jika sedang mengubah/menghapus 1 lomba, hapus juga cache detailnya
    if (id) {
      // Hapus berdasarkan variasi URL (berjaga-jaga jika Anda pakai prefix /api)
      await this.cacheManager.del(`/competitions/${id}`);
      await this.cacheManager.del(`/api/competitions/${id}`);
    }
  }

  // --- ENDPOINT PUBLIK ---

  @Public()
  @Get()
  @UseInterceptors(CacheInterceptor) // 3. INTERCEPTOR HANYA ADA DI SINI
  @CacheKey('COMPETITIONS_LIST_CACHE') // 4. KUNCI CACHE EKSPLISIT!
  @CacheTTL(300000)
  @ApiOperation({
    summary: 'Mendapatkan daftar semua perlombaan (Aktif Saja)',
    operationId: 'competitionsGetAll',
  })
  @ApiOkResponse({ type: [CompetitionResponseDto] })
  getAll(): Promise<CompetitionResponseDto[]> {
    return this.orchestrator.getAll(false); // Mengirim false (hanya lomba aktif)
  }

  @Public()
  @Get(':id')
  @UseInterceptors(CacheInterceptor) // INTERCEPTOR HANYA ADA DI SINI
  @CacheTTL(300000)
  @ApiOperation({ summary: 'Mendapatkan detail satu perlombaan' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: CompetitionResponseDto })
  getDetail(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<CompetitionResponseDto> {
    return this.orchestrator.getDetail(id);
  }

  // --- ENDPOINT KHUSUS ADMIN (Tanpa Cache Sama Sekali) ---

  @Get('admin/list')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '(ADMIN) Mendapatkan seluruh perlombaan termasuk nonaktif',
  })
  @ApiOkResponse({ type: [CompetitionResponseDto] })
  getAllForAdmin(): Promise<CompetitionResponseDto[]> {
    return this.orchestrator.getAll(true); // Mengirim true (tarik semua dari database)
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '(ADMIN) Menambahkan perlombaan beserta gelombangnya',
  })
  @ApiCreatedResponse({ type: CompetitionResponseDto })
  async create(
    @Body() dto: CreateCompetitionDto,
  ): Promise<CompetitionResponseDto> {
    const result = await this.orchestrator.create(dto);
    await this.invalidateCache();
    return result;
  }

  @Post('import')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '(ADMIN) Import array JSON data perlombaan',
  })
  async importCompetitions(
    @Body(new ParseArrayPipe({ items: CreateCompetitionDto }))
    data: CreateCompetitionDto[],
  ): Promise<{ imported: number; skipped: number }> {
    const result = await this.orchestrator.importCompetitions(data);
    if (result.imported > 0) {
      await this.invalidateCache();
    }
    return result;
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '(ADMIN) Memperbarui data perlombaan' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: CompetitionResponseDto })
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateCompetitionDto,
  ): Promise<CompetitionResponseDto> {
    const result = await this.orchestrator.update(id, dto);
    await this.invalidateCache(id); // Sertakan ID agar cache detail ikut terhapus
    return result;
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '(ADMIN) Menonaktifkan lomba (Soft Delete)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  async softDelete(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<{ message: string }> {
    const result = await this.orchestrator.softDelete(id);
    await this.invalidateCache(id);
    return result;
  }

  @Patch('waves/:waveId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '(ADMIN) Memperbarui harga atau jadwal gelombang' })
  @ApiParam({ name: 'waveId', format: 'uuid' })
  @ApiOkResponse({ type: CompetitionWaveDto })
  async updateWave(
    @Param('waveId', new ParseUUIDPipe({ version: '4' })) waveId: string,
    @Body() dto: UpdateWaveDto,
  ): Promise<CompetitionWaveDto> {
    const result = await this.orchestrator.updateWave(waveId, dto);
    await this.invalidateCache(); // Cukup hapus cache list
    return result;
  }
}
