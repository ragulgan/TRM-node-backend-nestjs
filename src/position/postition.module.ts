import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PositionService } from './postition.service';
import { Position, PositionSchema } from './position.schema';
import { PositionController } from './position.controller';
import { ResponseService } from '../base/controller';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Position.name, schema: PositionSchema }])
    ],
    controllers: [PositionController],
    providers: [PositionService, ResponseService],
    exports: [PositionService],
})
export class PositionModule { }