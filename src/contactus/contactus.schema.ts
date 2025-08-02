import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

enum Status {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    DELETED = 'DELETED'
}

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class ContactUs {

    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ required: true, trim: true })
    email: string;

    @Prop({ required: true, trim: true })
    mobileNumber: string;

    @Prop({ required: true, trim: true })
    message: string;

    @Prop({
        type: String,
        required: true,
        enum: ['UNREAD', 'READ'],
        default: 'UNREAD'
    })
    status: string;

    @Prop({ enum: Status, default: Status.ACTIVE })
    enquiryStatus: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Role' })
    role: string;
}

export const ContactUsSchema = SchemaFactory.createForClass(ContactUs);

ContactUsSchema.set('toJSON', {
    transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
    },
});