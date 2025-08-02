import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PromotionService } from './promotion.service';
import { Promotion, PromotionSchema } from './promotion.schema';
import { PromotionController } from './promotion.controller';
import { ResponseService } from '../base/controller';
import { PromotionEnquiry, PromotionEnquirySchema } from './promotionEnquiry.schema';
import { EmailServiceModule } from '../emailService/emailService.module';
import { Role, RoleSchema } from '../role/schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Promotion.name, schema: PromotionSchema }]),
    MongooseModule.forFeature([{ name: PromotionEnquiry.name, schema: PromotionEnquirySchema }]),
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
    EmailServiceModule
  ],
  controllers: [PromotionController],
  providers: [PromotionService, ResponseService],
  exports: [PromotionService],
})
export class PromotionModule {}