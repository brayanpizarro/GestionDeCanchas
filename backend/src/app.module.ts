import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CourtsModule } from './courts/courts.module';
import { ReservationsModule } from './reservations/reservations.module';
import { ProductsModule } from './products/products.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { CardModule } from './card/card.module';
import { ForgotPasswordModule } from './auth/forgot-password.module';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true 
    }), 
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        url: configService.get<string>('DATABASE_URL'),
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT', 5433),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        ssl: configService.get<string>('DB_SSL') === 'true'
          ? { rejectUnauthorized: configService.get<string>('DB_SSL_REJECT_UNAUTHORIZED') !== 'false' }
          : false,
        autoLoadEntities: true,
        synchronize: configService.get<string>('DB_SYNCHRONIZE') === 'true',
      }),
    }),
    UsersModule,
    AuthModule,
    CourtsModule,
    ProductsModule,
    ReservationsModule,
    ForgotPasswordModule,
    DashboardModule,
    CardModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
