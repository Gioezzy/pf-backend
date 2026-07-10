import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Get,
  Param,
  ParseUUIDPipe,
  Delete,
} from '@nestjs/common';
import { CurrentUser } from '../../../../identity/auth/interface/decorators/current-user.decorator';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiConsumes,
} from '@nestjs/swagger';
import { BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../identity/auth/interface/guards/jwt-auth.guard';
import { SubmissionsOrchestrator } from '../../applications/orchestrator/submissions.orchestrator';
import { CreateSubmissionDto } from '../../applications/dto/create-submission.dto';
import { MultipleFileUploadInterceptor } from '../../../../shared/storage/interface/interceptors/file-upload.interceptor';
import { Roles } from '../../../../identity/auth/interface/decorators/roles.decorator';
import { RolesGuard } from '../../../../identity/auth/interface/guards/roles.guard';
import { UserRole } from '../../../../identity/users/domains/entities/user.entity';

@ApiTags('Festival - Submissions')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly orchestrator: SubmissionsOrchestrator) {}

  // --- AREA PESERTA ---
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.PARTICIPANT)
  @UseInterceptors(MultipleFileUploadInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Mengunggah karya (Hanya Peserta)' })
  async createSubmission(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateSubmissionDto,
    @UploadedFiles()
    files: {
      file?: Express.Multer.File[];
      originalityFile?: Express.Multer.File[];
    },
  ) {
    const mainFile = files.file?.[0];
    const originalityFile = files.originalityFile?.[0];

    if (!mainFile) {
      throw new BadRequestException('Berkas karya (file) wajib dilampirkan.');
    }

    return this.orchestrator.createSubmission(
      userId,
      dto,
      mainFile,
      originalityFile,
    );
  }

  @Get('my-submission/:registrationId')
  @Roles(UserRole.PARTICIPANT)
  @ApiOperation({ summary: 'Melihat karya lomba sendiri' })
  async getMySubmission(
    @Param('registrationId', new ParseUUIDPipe()) registrationId: string,
  ) {
    return this.orchestrator.getMySubmission(registrationId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.PARTICIPANT)
  @ApiOperation({
    summary: 'Membatalkan/Menghapus karya (Hanya jika belum dinilai)',
  })
  async deleteSubmission(
    @CurrentUser('sub') userId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    await this.orchestrator.deleteSubmission(id, userId);
  }

  // --- AREA PANITIA / JURI ---
  @Get('competition/:competitionId')
  @Roles(UserRole.ADMIN, UserRole.COMMITTEE)
  @ApiOperation({
    summary:
      'Melihat semua karya yang terkumpul pada satu lomba (Khusus Panitia)',
  })
  async getSubmissionsByCompetition(
    @Param('competitionId', new ParseUUIDPipe()) competitionId: string,
  ) {
    return this.orchestrator.getSubmissionsByCompetition(competitionId);
  }
}
