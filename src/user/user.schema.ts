import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

enum Status {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    DELETED = 'DELETED'
}

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class User {
    @Prop({ required: true, unique: true, trim: true })
    companyName: string;

    @Prop({ required: false, trim: true })
    ownerName: string;

    @Prop({ required: false })
    profileImage: string;

    @Prop({ required: false })
    companyImage: string;

    @Prop({ required: false, trim: true })
    contactPersonName: string;

    @Prop({ required: false, trim: true })
    designation: string;

    @Prop({ unique: true, sparse: true, trim: true })
    email: string

    @Prop({ required: true, unique: true, trim: true })
    mobileNumber: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'State' })
    state: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'District' })
    district: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'City' })
    city: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Role' })
    role: string;

    @Prop({ enum: Status, default: Status.ACTIVE })
    status: Status;

    @Prop()
    registerNumber: string;

    @Prop()
    districtCount: string;

    @Prop()
    alternativeMobileNumber: string;

    @Prop()
    currentAddress: string;

    @Prop()
    description: string;

    @Prop({ type: Boolean, default: false })
    isCommitteeMember: boolean;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Position' })
    position: string;

    @Prop({ required: false, trim: true })
    companyTelephone: string;

    @Prop({ trim: true })
    website: string;

    @Prop()
    whatappno: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Manufacturer' })
    manufacturerId: string;

    @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'Category', required: false }])
    categoryId: string[];

    @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'SubCategory', required: false }])
    subcategoryId: string[];

    @Prop()
    isExistUser: boolean;

    @Prop()
    type: string;

    @Prop()
    postalCode: string;

    @Prop()
    memberJoiningDate: Date;

    @Prop({ type: [String], required: false })
    productName: string[];
}
export const Userchema = SchemaFactory.createForClass(User);
Userchema.set('toJSON', {
    transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
    },
});