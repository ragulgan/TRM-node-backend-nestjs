import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GalleryService } from './gallery.service';
import { Gallery, Gallerychema } from './gallery.schema';
import { GalleryController } from './gallery.controller';
import { ResponseService } from '../base/controller';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Gallery.name, schema: Gallerychema }]),
    ],
    controllers: [GalleryController],
    providers: [GalleryService, ResponseService],
    exports: [GalleryService],
})
export class GalleryModule { }