import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { MongooseModule } from "@nestjs/mongoose";
import { LocalStrategy } from './local.auth';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtStrategy } from './jwt.strategy';
import { Otp, OtpSchema } from '../otp/otp.schema';
import { ResponseService } from '../base/controller';
import { AdminService } from '../adminUsers/admin.service';
import { Admin, AdminSchema } from "../adminUsers/admin.schema";
import { OtpService } from "../otp/otp.service";
import { AdminActivity, AdminActivitySchema } from '../adminUsers/adminActivites.schema';
import { EmailServiceModule } from '../emailService/emailService.module';
import { User, Userchema } from "../user/user.schema";
import { UserService } from "../user/user.service";
import { UserModule } from "../user/user.module";
import { SystemVariables, SystemVariablesSchema } from "../systemVariables/systemVariables.schema";
import { Role, RoleSchema } from '../role/schema';
import { UserActivity, UserActivitySchema } from '../user/userActivities.schema';
import { District, DistrictSchema } from "src/district/district.schema";
import { ValidateOtp, OtpValidateSchema } from "src/user/validateotp";
import { State, StateSchema } from '../state/state.schema';
import { City, CitySchema } from '../city/city.schema';

@Module({
    imports: [
        EmailServiceModule,
        UserModule,
        PassportModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
            // secret: process.env.JWT_SECRET,
            secret: 'mySecretKey123',
            signOptions: { expiresIn: '30d' },
        }),
        MongooseModule.forFeature([{ name: AdminActivity.name, schema: AdminActivitySchema }]),
        MongooseModule.forFeature([{ name: UserActivity.name, schema: UserActivitySchema }]),
        MongooseModule.forFeature([{ name: User.name, schema: Userchema }]),
        MongooseModule.forFeature([{ name: Otp.name, schema: OtpSchema }]),
        MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
        MongooseModule.forFeature([{ name: SystemVariables.name, schema: SystemVariablesSchema }]),
        MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
        MongooseModule.forFeature([{ name: District.name, schema: DistrictSchema }]),
        MongooseModule.forFeature([{ name: ValidateOtp.name, schema: OtpValidateSchema }]),
        MongooseModule.forFeature([{ name: State.name, schema: StateSchema }]),
        MongooseModule.forFeature([{ name: City.name, schema: CitySchema }]),
    ],
    controllers: [AuthController],
    exports: [AuthService],
    providers: [AuthService,
        UserService,
        LocalStrategy, OtpService, LocalStrategy, JwtAuthGuard, JwtStrategy, ResponseService, AdminService],
})
export class AuthModule { }