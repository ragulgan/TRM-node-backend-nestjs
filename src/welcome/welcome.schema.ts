import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BannerType, Status } from 'src/libs/constants';

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class Welcome {
    @Prop()
    subtitle: string;

    @Prop({ required: true, unique: true, sparse: true })
    title: string;

    @Prop()
    image: string;

    @Prop()
    description: string;

    @Prop({ enum: BannerType, default: BannerType.HOME })
    bannerType: BannerType;

    @Prop({ enum: Status, default: Status.ACTIVE })
    status: Status;

    @Prop()
    kuralNo: string;
}
export const WelcomeSchema = SchemaFactory.createForClass(Welcome);
WelcomeSchema.set('toJSON', {
    transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
    },
});