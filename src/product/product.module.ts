import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductService } from './product.service';
import { Product, ProductSchema } from './product.schema';
import { ProductController } from './product.controller';
import { ResponseService } from '../base/controller';
import { EmailServiceModule } from '../emailService/emailService.module';
import { User, Userchema } from 'src/user/user.schema';
import { ProductEnquiry, ProductEnquirySchema } from './productEnquiry.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
        MongooseModule.forFeature([{ name: User.name, schema: Userchema }]),
        MongooseModule.forFeature([{ name: ProductEnquiry.name, schema: ProductEnquirySchema }]),
        EmailServiceModule
    ],
    controllers: [ProductController],
    providers: [ProductService, ResponseService],
    exports: [ProductService],
})
export class ProductModule { }