import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class PromotionEnquiry {

  @Prop()
  companyName: string;

  @Prop()
  ownerName: string;

  @Prop()
  fromEmail: string;

  @Prop()
  toEmail: string;

  @Prop()
  mobileNumber: string;

  @Prop()
  district: string;

  @Prop()
  city: string;

  @Prop()
  message: string;

  @Prop()
  role: string;

  @Prop()
  productOwnername: string;

  @Prop()
  productName: string;

  @Prop()
  productOwnerRole: string;

  @Prop()
  productOwnerCompanyName: string;

  @Prop({
    type: String,
    enum: ['UNRESOLVE', 'SOLVED', 'DELETED'],
    default: 'UNRESOLVE'
  })
  status: string;
}

export const PromotionEnquirySchema = SchemaFactory.createForClass(PromotionEnquiry);

PromotionEnquirySchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});