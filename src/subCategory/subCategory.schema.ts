import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class SubCategory {
    @Prop({ required: true, unique: true })
    subCategoryName: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category' })
    categoryId: String

    @Prop({
        type: String,
        required: true,
        enum: ['ACTIVE', 'INACTIVE', 'DELETED'],
        default: 'ACTIVE'
    })
    status: string;
}

export const SubCategorySchema = SchemaFactory.createForClass(SubCategory);

SubCategorySchema.set('toJSON', {
    transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
    },
});