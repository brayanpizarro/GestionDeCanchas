import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { CourtsModule } from '../courts/courts.module';
import { UsersModule } from '../users/users.module';
import { ProductsModule } from 'products/products.module';

@Module({
  imports: [CourtsModule, UsersModule,ProductsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
