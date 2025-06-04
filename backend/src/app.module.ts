import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; 
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CourtsModule } from './courts/courts.module';
import { ReservationsModule } from './reservations/reservations.module';
import { ProductsModule } from "./products/products.module";
import { DashboardModule } from './dashboard/dashboard.module';
import { CardModule } from './card/card.module';


@Module({  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // ✅ cargar .env automáticamente
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5433'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'dbingeso',
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    CourtsModule,
    ProductsModule,
    ReservationsModule,
    DashboardModule,
    CardModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
