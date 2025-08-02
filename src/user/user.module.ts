import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { User, Userchema } from './user.schema';
import { UserController } from './user.controller';
import { ResponseService } from '../base/controller';
import { OtpModule } from '../otp/otp.module';
import { Otp, OtpSchema } from '../otp/otp.schema';
import { SystemVariables, SystemVariablesSchema } from 'src/systemVariables/systemVariables.schema';
import { Role, RoleSchema } from 'src/role/schema';
import { UserActivity, UserActivitySchema } from './userActivities.schema';
import { AdminModule } from '../adminUsers/admin.module';
import { EmailServiceModule } from '../emailService/emailService.module';
import { District, DistrictSchema } from '../district/district.schema';
import { ValidateOtp, OtpValidateSchema } from './validateotp';
import { State, StateSchema } from '../state/state.schema';
import { City, CitySchema } from '../city/city.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: Userchema }]),
        MongooseModule.forFeature([{ name: Otp.name, schema: OtpSchema }]),
        MongooseModule.forFeature([{ name: SystemVariables.name, schema: SystemVariablesSchema }]),
        MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
        MongooseModule.forFeature([{ name: UserActivity.name, schema: UserActivitySchema }]),
        MongooseModule.forFeature([{ name: District.name, schema: DistrictSchema }]),
        MongooseModule.forFeature([{ name: ValidateOtp.name, schema: OtpValidateSchema }]),
        MongooseModule.forFeature([{ name: State.name, schema: StateSchema }]),
        MongooseModule.forFeature([{ name: City.name, schema: CitySchema }]),
        OtpModule,
        AdminModule,
        EmailServiceModule
    ],
    controllers: [UserController],
    providers: [UserService, ResponseService],
    exports: [UserService],
})
export class UserModule { }
