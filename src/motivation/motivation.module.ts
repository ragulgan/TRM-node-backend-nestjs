import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MotivationService } from './motivation.service';
import { Motivation, MotivationSchema } from './motivation.schema';
import { MotivationController } from './motivation.controller';
import { ResponseService } from '../base/controller';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Motivation.name, schema: MotivationSchema }])
    ],
    controllers: [MotivationController],
    providers: [MotivationService, ResponseService],
    exports: [MotivationService],
})
export class MotivationModule { }