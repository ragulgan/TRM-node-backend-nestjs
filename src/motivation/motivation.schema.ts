import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class Motivation {

    @Prop({ required: true, unique: true })
    title: string;

    @Prop()
    titleImage: string;

    @Prop({ required: true, unique: true })
    message: String

    @Prop({
        type: String,
        required: true,
        enum: ['ACTIVE', 'INACTIVE', 'DELETED'],
        default: 'ACTIVE'
    })
    status: string;
}

export const MotivationSchema = SchemaFactory.createForClass(Motivation);

MotivationSchema.set('toJSON', {
    transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
    },
});