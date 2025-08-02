import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class Otp {

    @Prop({
        type: String,
        required: true
    })
    mobileNumber: string;

    @Prop({
        type: String,
        required: true
    })
    otp: string;

    @Prop()
    type: string;

    @Prop({
        type: String,
        required: true
    })

    @Prop({
        type: String,
        required: true,
        enum: ['PENDING', 'VERIFIED', 'EXPIRED'],
        default: 'PENDING'
    })
    status: string;

    @Prop({ type: Object })
    smsResponse: any;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
OtpSchema.set('toJSON', {
    transform: (ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
    },
});