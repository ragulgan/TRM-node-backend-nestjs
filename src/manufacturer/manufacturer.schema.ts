import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Status } from 'src/libs/constants';

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class Manufacturer {
    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ enum: Status, default: Status.ACTIVE, required: true, trim: true })
    status: Status;

    @Prop({ required: true, trim: true })
    displayName: string;
}

export const ManufacturerSchema = SchemaFactory.createForClass(Manufacturer);

ManufacturerSchema.set('toJSON', {
    transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
    },
});