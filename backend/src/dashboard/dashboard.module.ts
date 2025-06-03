import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { UsersModule } from '../users/users.module';
import { ProductsModule } from '../products/products.module';
import { CourtsModule } from '../courts/courts.module';

@Module({
    imports: [
        UsersModule,
        ProductsModule,
        CourtsModule
    ],
    controllers: [DashboardController],
    providers: [DashboardService],
    exports: [DashboardService]
})
export class DashboardModule {}
