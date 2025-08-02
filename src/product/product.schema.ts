import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';
enum Status {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    DELETED = 'DELETED'
}

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class Product extends Document {

    @Prop({ required: true })
    productName: string;

    @Prop({ required: false })
    productPrice: string;

    @Prop({ type: [String], required: false })
    productImage: string[];

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Role' })
    role: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
    userId: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category', required: true })
    category: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'SubCategory', required: true })
    subCategory: string;

    @Prop({ default: 'Product description' })
    description: string;

    @Prop({ enum: Status, default: Status.ACTIVE })
    status: Status;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.set('toJSON', {
    transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
    },
});