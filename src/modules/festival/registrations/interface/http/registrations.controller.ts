import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  UnauthorizedException,
  Param,
  ParseUUIDPipe,
  Patch,
  UseFilters,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBody,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiPayloadTooLargeResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../../../../identity/auth/interface/guards/jwt-auth.guard';
import { RegistrationsOrchestrator } from '../../applications/orchestrator/registrations.orchestrator';
import { RegisterCompetitionDto } from '../../applications/dto/register-competition.dto';
import { RegistrationResponseDto } from '../../applications/dto/registration-response.dto';
import { VerifyPaymentDto } from '../../applications/dto/verify-payment.dto';
import { Roles } from 'src/modules/identity/auth/interface/decorators/roles.decorator';
import { RolesGuard } from 'src/modules/identity/auth/interface/guards/roles.guard';
import { UserRole } from 'src/modules/identity/users/domains/entities/user.entity';
import { ChampionTitle } from '../../domains/entities/registration.entity';
import { RegistrationFileUploadInterceptor } from '../../../../shared/storage/interface/interceptors/file-upload.interceptor';
import { FileSizeGuard } from '../../../../shared/storage/interface/guards/file-size.guard';
import { StorageExceptionFilter } from '../../../../shared/storage/interface/filters/storage-exception.filter';

export interface JwtPayload {
  id?: string;
  sub?: string;
  userId?: string;
  email?: string;
  role?: string;
}

export interface RequestWithUser extends Request {
  user: JwtPayload;
}

@ApiTags('Festival - Registrations')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('registrations')
export class RegistrationsController {
  constructor(private readonly orchestrator: RegistrationsOrchestrator) {}

  @Throttle({ dashboard: {} })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Mendaftar ke sebuah lomba (Individu / Tim)' })
  @ApiCreatedResponse({ type: RegistrationResponseDto })
  @Roles(UserRole.PARTICIPANT)
  async register(
    @Req() req: RequestWithUser,
    @Body() dto: RegisterCompetitionDto,
  ): Promise<RegistrationResponseDto> {
    const activeUserId = req.user.id || req.user.sub || req.user.userId;
    if (!activeUserId) {
      throw new UnauthorizedException(
        'Gagal memverifikasi identitas. Format token tidak dikenali.',
      );
    }
    return this.orchestrator.register(activeUserId, dto);
  }

  @SkipThrottle()
  @Get('my-registrations')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.PARTICIPANT)
  @ApiOperation({
    summary: 'Melihat seluruh riwayat pendaftaran pengguna & timnya',
  })
  @ApiOkResponse({ type: [RegistrationResponseDto] })
  async getMyRegistrations(
    @Req() req: RequestWithUser,
  ): Promise<RegistrationResponseDto[]> {
    const activeUserId = req.user.id || req.user.sub || req.user.userId;

    if (!activeUserId) {
      throw new UnauthorizedException(
        'Gagal memverifikasi identitas. Format token tidak dikenali.',
      );
    }

    return this.orchestrator.getMyRegistrations(activeUserId);
  }

  // ── Upload Bukti Pembayaran (Peserta) ────────────────────────────────────

  @Throttle({ dashboard: {} })
  @Post(':id/payment-proof')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.PARTICIPANT)
  @UseGuards(FileSizeGuard)
  @UseInterceptors(RegistrationFileUploadInterceptor)
  @UseFilters(StorageExceptionFilter)
  @ApiOperation({
    summary: 'Unggah bukti pembayaran dan kartu tanda siswa',
    description:
      'Peserta (atau ketua tim untuk lomba berkelompok) mengunggah bukti transfer dan kartu identitas/pelajar. ' +
      'Status pendaftaran akan berubah menjadi PENDING_VERIFICATION dan menunggu approval bendahara.\n\n' +
      '**Format yang didukung:** JPG, PNG, WebP, PDF. **Ukuran maksimum:** 20MB per file.\n\n' +
      'Hanya bisa diunggah selagi status PENDING_PAYMENT, atau diunggah ulang jika sebelumnya REJECTED.',
    operationId: 'registrationsUploadPaymentProof',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'identityCardFile'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File bukti pembayaran (JPG/PNG/WebP/PDF, maks 20MB)',
        },
        identityCardFile: {
          type: 'string',
          format: 'binary',
          description:
            'File kartu identitas/tanda siswa (JPG/PNG/WebP/PDF, maks 20MB)',
        },
      },
    },
  })
  @ApiOkResponse({
    type: RegistrationResponseDto,
    description:
      'Bukti pembayaran dan identitas berhasil diunggah, menunggu verifikasi bendahara.',
  })
  @ApiForbiddenResponse({
    description: 'Anda bukan pemilik pendaftaran ini (atau bukan ketua tim).',
  })
  @ApiNotFoundResponse({ description: 'Pendaftaran tidak ditemukan.' })
  @ApiUnprocessableEntityResponse({
    description:
      'File tidak ada, format tidak didukung, atau status pendaftaran tidak mengizinkan upload.',
  })
  @ApiPayloadTooLargeResponse({
    description: 'Ukuran file melebihi batas 20MB.',
  })
  uploadPaymentProof(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @UploadedFiles()
    files: {
      file?: Express.Multer.File[];
      identityCardFile?: Express.Multer.File[];
    },
    @Req() req: RequestWithUser,
  ): Promise<RegistrationResponseDto> {
    const activeUserId = req.user.id || req.user.sub || req.user.userId;
    if (!activeUserId) {
      throw new UnauthorizedException(
        'Gagal memverifikasi identitas. Format token tidak dikenali.',
      );
    }
    const paymentFile = files?.file?.[0];
    const identityCardFiles = files?.identityCardFile || [];
    return this.orchestrator.uploadPaymentProof(
      id,
      activeUserId,
      paymentFile,
      identityCardFiles,
    );
  }

  // ── Verifikasi Bukti Pembayaran (Bendahara) ──────────────────────────────

  @SkipThrottle()
  @Get('bendahara/pending-verification')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.TREASURER)
  @ApiOperation({
    summary:
      'Melihat antrean pendaftaran yang menunggu verifikasi pembayaran (Khusus Bendahara)',
    description:
      'Menampilkan seluruh pendaftaran lintas lomba berstatus PENDING_VERIFICATION, ' +
      'diurutkan dari yang paling lama menunggu.',
  })
  @ApiOkResponse({ type: [RegistrationResponseDto] })
  getPendingVerifications(): Promise<RegistrationResponseDto[]> {
    return this.orchestrator.getPendingVerifications();
  }

  @Throttle({ dashboard: {} })
  @Patch('bendahara/:id/verify')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.TREASURER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Menyetujui atau menolak bukti pembayaran (Khusus Bendahara)',
    description:
      'action=APPROVE akan mengubah status menjadi VERIFIED. ' +
      'action=REJECT wajib menyertakan `note` dan mengembalikan status ke REJECTED ' +
      'sehingga peserta dapat mengunggah ulang bukti pembayaran.',
  })
  @ApiBody({ type: VerifyPaymentDto })
  @ApiOkResponse({ type: RegistrationResponseDto })
  @ApiNotFoundResponse({ description: 'Pendaftaran tidak ditemukan.' })
  verifyPayment(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: VerifyPaymentDto,
    @Req() req: RequestWithUser,
  ): Promise<RegistrationResponseDto> {
    const bendaharaUserId = req.user.id || req.user.sub || req.user.userId;
    if (!bendaharaUserId) {
      throw new UnauthorizedException(
        'Gagal memverifikasi identitas. Format token tidak dikenali.',
      );
    }
    return this.orchestrator.verifyPayment(id, bendaharaUserId, dto);
  }

  @SkipThrottle()
  @Get('admin/competition/:competitionId/verified')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.COMMITTEE, UserRole.TREASURER) // Proteksi admin
  @ApiOperation({
    summary:
      'Melihat seluruh pendaftar tervalidasi pada suatu lomba (Khusus Admin)',
  })
  @ApiOkResponse({ type: [RegistrationResponseDto] })
  async getVerifiedParticipants(
    @Param('competitionId', new ParseUUIDPipe({ version: '4' }))
    competitionId: string,
  ): Promise<RegistrationResponseDto[]> {
    return this.orchestrator.getVerifiedRegistrationsByCompetition(
      competitionId,
    );
  }

  @Throttle({ dashboard: {} })
  @Patch('admin/:id/set-champion')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN) // Proteksi admin
  @ApiOperation({
    summary: 'Menetapkan gelar juara untuk peserta/tim (Khusus Admin)',
  })
  @ApiBody({
    schema: {
      properties: {
        title: { type: 'string', enum: Object.values(ChampionTitle) },
      },
    },
  })
  @ApiOkResponse({ type: RegistrationResponseDto })
  async setChampion(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body('title') title: ChampionTitle,
  ): Promise<RegistrationResponseDto> {
    return this.orchestrator.setChampionTitle(id, title);
  }
}
