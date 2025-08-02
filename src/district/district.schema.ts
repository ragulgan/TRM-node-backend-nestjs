import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class District {

    @Prop({ required: true, unique: true })
    districtName: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'State' })
    stateId: String

    @Prop({ required: true, unique: true, trim: true })
    districtCode: string;

    @Prop({
        type: String,
        required: true,
        enum: ['ACTIVE', 'INACTIVE', 'DELETED'],
        default: 'ACTIVE'
    })
    status: string;
}

export const DistrictSchema = SchemaFactory.createForClass(District);

DistrictSchema.set('toJSON', {
    transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
    },
});