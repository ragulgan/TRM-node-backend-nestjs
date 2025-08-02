import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class Promotion {

  @Prop({ required: true, unique: true })
  addTitle: string;

  @Prop({ required: true, unique: true })
  description: String

  @Prop()
  addImage: string;

  @Prop()
  videoUrl: string;

  @Prop({ required: false })
  startDate: Date;

  @Prop({ required: false })
  endDate: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category', required: false })
  category: String


  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Role' })
  role: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
  userId: String

  @Prop({
    type: String,
    required: true,
    enum: ['ACTIVE', 'INACTIVE', 'DELETED'],
    default: 'ACTIVE'
  })
  status: string;
}

export const PromotionSchema = SchemaFactory.createForClass(Promotion);

PromotionSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});