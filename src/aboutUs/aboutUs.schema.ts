import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

enum Status {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    PENDING = 'PENDING',
}

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class AboutUs {

    @Prop()
    title: string;

    @Prop()
    Image: string;

    @Prop()
    discription: string;

    @Prop({ enum: Status, default: Status.ACTIVE })
    status: Status;
}
export const AboutUsSchema = SchemaFactory.createForClass(AboutUs);
AboutUsSchema.set('toJSON', {
    transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
    },
});