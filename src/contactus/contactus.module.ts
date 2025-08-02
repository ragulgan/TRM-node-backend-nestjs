import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResponseService } from '../base/controller';
import { ContactUs, ContactUsSchema } from './contactus.schema';
import { ContactUsController } from './contactus.controller';
import { ContactUsService } from './contactus.service';
import { Role, RoleSchema } from '../role/schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: ContactUs.name, schema: ContactUsSchema }]),
        MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
    ],
    controllers: [ContactUsController],
    providers: [ContactUsService, ResponseService],
    exports: [ContactUsService],
})
export class ContactUsModule { }