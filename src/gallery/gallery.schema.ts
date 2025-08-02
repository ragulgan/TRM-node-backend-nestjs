import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

enum Status {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    PENDING = 'PENDING',
}

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class Gallery {

    @Prop({ required: true, unique: true, trim: true })
    title: string;

    @Prop({ type: [String] })
    titleImage: string[];

    @Prop({ enum: Status, default: Status.ACTIVE })
    status: Status;

    @Prop({ trim: true })
    description: string;

    @Prop()
    eventDate: Date;

    @Prop({ trim: true, required: false })
    eventTime: string;

    @Prop({ trim: true })
    location: string;
}
export const Gallerychema = SchemaFactory.createForClass(Gallery);
Gallerychema.set('toJSON', {
    transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
    },
});