import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ManufacturerService } from './manufacturer.service';
import { Manufacturer, ManufacturerSchema } from './manufacturer.schema';
import { ManufacturerController } from './manufacturer.controller';
import { ResponseService } from '../base/controller';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Manufacturer.name, schema: ManufacturerSchema }])
    ],
    controllers: [ManufacturerController],
    providers: [ManufacturerService, ResponseService],
    exports: [ManufacturerService],
})
export class ManufacturerModule { }