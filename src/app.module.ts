import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, type TypeOrmModuleOptions } from '@nestjs/typeorm';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import {
  ThrottlerModule,
  ThrottlerGuard,
  type ThrottlerModuleOptions,
} from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Import Validasi Environment
import { validate } from './modules/shared/config/env.validation';

// Import Modul Fitur
import { AuthModule } from './modules/identity/auth/auth.module';
import { UserModule } from './modules/identity/users/user.module';
import { StorageModule } from './modules/shared/storage/storage.module';
import { MailModule } from './modules/shared/mail/mail.module';
import { CompetitionsModule } from './modules/festival/competitions/competitions.module';
import { TeamsModule } from './modules/festival/teams/teams.module';
import { RegistrationsModule } from './modules/festival/registrations/registrations.module';
import { SubmissionsModule } from './modules/festival/submissions/submissions.module';
import { NotificationsModule } from './modules/shared/notifications/notifications.module';
import { GlobalExceptionFilter } from './modules/shared/common/filters/global-exception.filter';
import { LoggingMiddleware } from './modules/shared/common/middlewares/logging.middleware';

@Module({
  imports: [
    // 1. Konfigurasi Environment (Global)
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      envFilePath: process.env.NODE_ENV === 'production' ? '.env' : '.env.development.local',
    }),

    // 2. Konfigurasi Database (TypeORM - MySQL)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const isProduction =
          configService.get<string>('NODE_ENV') === 'production';
        return {
          type: 'mysql',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_DATABASE'),
          autoLoadEntities: true,
          synchronize: !isProduction,
          extra: {
            connectionLimit: configService.get<number>('DB_CONNECTION_LIMIT'),
          },
        };
      },
    }),

    // 3. Konfigurasi Rate Limiting (Throttler / Anti-Spam)
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): ThrottlerModuleOptions => ({
        throttlers: [
          {
            // Default: fallback untuk semua endpoint yang tidak spesifik
            name: 'default',
            ttl: configService.get<number>('THROTTLE_TTL_DEFAULT', 60000),
            limit: configService.get<number>('THROTTLE_LIMIT_DEFAULT', 1000),
          },
          {
            // Strict: untuk endpoint sensitif (login, register, OTP)
            name: 'strict',
            ttl: configService.get<number>('THROTTLE_TTL_STRICT', 60000),
            limit: configService.get<number>('THROTTLE_LIMIT_STRICT', 50),
          },
          {
            // Dashboard: untuk aksi mutasi di area dashboard oleh user terautentikasi
            // Sangat longgar — 500 request per menit per IP
            name: 'dashboard',
            ttl: configService.get<number>('THROTTLE_TTL_DASHBOARD', 60000),
            limit: configService.get<number>('THROTTLE_LIMIT_DASHBOARD', 500),
          },
        ],
      }),
    }),

    // 4. Konfigurasi Event Emitter (Global)
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),

    // 5. Daftarkan Modul Fitur Aplikasi
    AuthModule,
    UserModule,
    StorageModule,
    MailModule,
    CompetitionsModule,
    TeamsModule,
    RegistrationsModule,
    SubmissionsModule,
    NotificationsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
