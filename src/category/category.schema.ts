import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class Category {

  @Prop({ required: true, unique: true })
  categoryName: string;

  @Prop({
    type: String,
    required: true,
    enum: ['ACTIVE', 'INACTIVE', 'DELETED'],
    default: 'ACTIVE'
  })
  status: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});