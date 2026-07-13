import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity, UserRole } from '../../domains/entities/user.entity';

@Injectable()
export class AdminSeederService implements OnModuleInit {
  private readonly logger = new Logger(AdminSeederService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async onModuleInit() {
    await this.ensureNpsnColumn();
    await this.seedAdmin();
  }

  private async ensureNpsnColumn() {
    try {
      await this.userRepo.query('SELECT npsn FROM users LIMIT 1');
    } catch (e) {
      try {
        await this.userRepo.query('ALTER TABLE `users` ADD COLUMN `npsn` varchar(20) NULL');
        this.logger.log('✅ Kolom npsn berhasil ditambahkan ke tabel users secara otomatis!');
      } catch (err) {
        this.logger.error('❌ Gagal menambahkan kolom npsn secara otomatis', err);
      }
    }
  }

  private async seedAdmin() {
    const adminEmail = 'admin@festival.com';

    try {
      const existingAdmin = await this.userRepo.findOne({
        where: { email: adminEmail },
      });

      if (!existingAdmin) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('AdminFestival123!', salt);

        const admin = this.userRepo.create({
          email: adminEmail,
          password: hashedPassword,
          role: UserRole.ADMIN,
          fullName: 'Super Admin',
        });

        await this.userRepo.save(admin);
        this.logger.log('✅ Akun Admin default berhasil dibuat!');
      } else {
        this.logger.log('⚡ Akun Admin sudah ada, proses seeding dilewati.');
      }
    } catch (error) {
      this.logger.error('❌ Gagal menjalankan seeder Admin', error);
    }
  }
}
