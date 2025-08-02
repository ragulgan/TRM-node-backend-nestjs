import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NewsAndEventsService } from './newsandevents.service';
import { NewsAndEvents, NewsAndEventschema } from './newsandevents.schema';
import { NewsAndEventsController } from './newsandevents.controller';
import { ResponseService } from '../base/controller';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: NewsAndEvents.name, schema: NewsAndEventschema }]),
    ],
    controllers: [NewsAndEventsController],
    providers: [NewsAndEventsService, ResponseService],
    exports: [NewsAndEventsService],
})
export class NewsAndEventsModule { }