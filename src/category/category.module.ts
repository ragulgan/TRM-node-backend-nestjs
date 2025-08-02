import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoryService } from './category.service';
import { Category, CategorySchema } from './category.schema';
import { CategoryController } from './category.controller';
import { ResponseService } from '../base/controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }])
  ],
  controllers: [CategoryController],
  providers: [CategoryService, ResponseService],
  exports: [CategoryService],
})
export class CategoryModule {}