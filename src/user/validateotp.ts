import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Interface for the document type with timestamps
export interface ValidateOtpDocument extends Document {
	mobileNumber: string;
	status: 'PENDING' | 'VERIFIED' | 'EXPIRED';
	createdAt: Date;
	updatedAt: Date;
}

@Schema({
	toJSON: { versionKey: false },
	toObject: { versionKey: false },
	timestamps: true,
})

export class ValidateOtp {
	@Prop({
		type: String,
		required: true,
	})
	mobileNumber: string;

	@Prop({
		type: String,
		required: true,
		enum: ['PENDING', 'VERIFIED', 'EXPIRED'],
		default: 'PENDING',
	})
	status: 'PENDING' | 'VERIFIED' | 'EXPIRED';
}

export const OtpValidateSchema = SchemaFactory.createForClass(ValidateOtp);

// Custom transformation for toJSON
OtpValidateSchema.set('toJSON', {
	transform: (doc, ret) => {
		ret.id = ret._id.toString(); // Map `_id` to `id`
		delete ret._id; // Remove `_id`
		return ret;
	},
});