import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

enum Status {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    PENDING = 'PENDING',
}

@Schema({ toJSON: { versionKey: false }, toObject: { versionKey: false }, timestamps: true })
export class NewsAndEvents {

    @Prop()
    title: string;

    @Prop()
    titleImage: string;

    // @Prop()
    // videoUrl: string;

    @Prop()
    description: string;

    @Prop({ enum: Status, default: Status.ACTIVE })
    status: Status;
}
export const NewsAndEventschema = SchemaFactory.createForClass(NewsAndEvents);
NewsAndEventschema.set('toJSON', {
    transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
    },
});