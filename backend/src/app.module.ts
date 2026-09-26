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
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const ssl = configService.get<string>('DB_SSL') === 'true'
          ? { rejectUnauthorized: configService.get<string>('DB_SSL_REJECT_UNAUTHORIZED') !== 'false' }
          : false;

        const connection = databaseUrl
          ? { url: databaseUrl }
          : {
              host: configService.getOrThrow<string>('DB_HOST'),
              port: Number(configService.getOrThrow<string>('DB_PORT')),
              username: configService.getOrThrow<string>('DB_USER'),
              password: configService.getOrThrow<string>('DB_PASSWORD'),
              database: configService.getOrThrow<string>('DB_NAME'),
            };

        return {
          type: 'postgres' as const,
          ...connection,
          ssl,
          autoLoadEntities: true,
          synchronize: configService.get<string>('DB_SYNCHRONIZE') === 'true',
        };
      },
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
