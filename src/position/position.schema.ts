import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class Position {

    @Prop({ required: true, unique: true })
    position: string;

    @Prop()
    displayOrder: number;

    @Prop({
        type: String,
        required: true,
        enum: ['ACTIVE', 'INACTIVE', 'DELETED'],
        default: 'ACTIVE'
    })
    status: string;
}

export const PositionSchema = SchemaFactory.createForClass(Position);

PositionSchema.set('toJSON', {
    transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
    },
});