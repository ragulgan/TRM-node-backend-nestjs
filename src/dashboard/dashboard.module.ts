import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardService } from './dashboard.service';
import { User, Userchema } from '../user/user.schema';
import { ResponseService } from '../base/controller';
import { Product, ProductSchema } from '../product/product.schema';
import { DashboardController } from './dashboard.controller';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: Userchema }]),
        MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }])
    ],
    controllers: [DashboardController],
    providers: [DashboardService, ResponseService],
    exports: [DashboardService, MongooseModule],
})
export class DashboardModule { }