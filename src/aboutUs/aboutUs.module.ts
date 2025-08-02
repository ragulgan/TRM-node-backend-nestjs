import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AboutUsService } from './aboutUs.service';
import { AboutUs, AboutUsSchema } from './aboutUs.schema';
import { AboutUsController } from './aboutUs.controller';
import { ResponseService } from '../base/controller';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: AboutUs.name, schema: AboutUsSchema }]),
    ],
    controllers: [AboutUsController],
    providers: [AboutUsService, ResponseService],
    exports: [AboutUsService],
})
export class AboutUsModule { }