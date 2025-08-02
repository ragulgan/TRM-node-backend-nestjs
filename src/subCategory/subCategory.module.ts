import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubCategoryService } from './subCategory.service';
import { SubCategory, SubCategorySchema } from './subCategory.schema';
import { SubCategoryController } from './subCategory.controller';
import { ResponseService } from '../base/controller';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: SubCategory.name, schema: SubCategorySchema }])
    ],
    controllers: [SubCategoryController],
    providers: [SubCategoryService, ResponseService],
    exports: [SubCategoryService],
})
export class SubCategoryModule { }