import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DistrictService } from './district.service';
import { District, DistrictSchema } from './district.schema';
import { DistrictController } from './district.controller';
import { ResponseService } from '../base/controller';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: District.name, schema: DistrictSchema }])
    ],
    controllers: [DistrictController],
    providers: [DistrictService, ResponseService],
    exports: [DistrictService],
})
export class DistrictModule { }