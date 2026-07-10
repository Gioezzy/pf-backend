// src/auth/applications/use-cases/register.use-case.ts
import { Inject, Injectable } from '@nestjs/common';
import { RegisterDto } from '../dto/register.dto';
import { CreateUserUseCase } from '../../../users/applications/use-cases/create-user.use-case';
import { CreateUserDto } from '../../../users/applications/dto/create-user.dto';
import {
  type IUserRepository,
  USER_REPOSITORY_TOKEN,
} from '../../../users/infrastructures/repositories/user.repository.interface';
import { MailService } from '../../../../shared/mail/mail.service';

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly mailService: MailService,
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(
    dto: RegisterDto,
  ): Promise<{ message: string; userId: string }> {
    // 1. Mapping data dari RegisterDto ke CreateUserDto
    const createDto: CreateUserDto = {
      email: dto.email,
      password: dto.password,
      fullName: dto.fullName,
      phoneNumber: dto.phoneNumber,
      institution: dto.institution,
    };

    // 2. Insert user ke database
    const user = await this.createUserUseCase.executeAndReturnEntity(createDto);

    // 3. Generate 6 digit OTP & set kedaluwarsa 10 menit
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date();
    otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + 10);

    // 4. Update state user dengan OTP yang di-generate
    await this.userRepo.update(user.id, {
      otpCode,
      otpExpiresAt,
      isEmailVerified: false,
      isActive: false,
    });

    // 5. Kirim OTP via Email
    await this.mailService.sendOtpEmail(
      user.email,
      user.fullName ?? 'Peserta',
      otpCode,
    );

    // 6. Kembalikan response sukses tanpa mengekspos JWT
    return {
      message:
        'Registrasi berhasil. Silakan cek email Anda untuk kode verifikasi.',
      userId: user.id,
    };
  }
}
