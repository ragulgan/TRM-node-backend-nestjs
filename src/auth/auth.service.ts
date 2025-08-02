import { Injectable, NotAcceptableException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as _ from 'lodash';
import { AdminService } from '../adminUsers/admin.service';
import * as jwt from 'jsonwebtoken';
import { OtpService } from "../otp/otp.service";
import { LoginDto, OtpDto, ResendOtpDto, SendSMSOTP } from './dto/logindto';
const moment = require('moment');
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
const saltOrRounds = 10;
import { AdminActivity } from '../adminUsers/adminActivites.schema';
import { UserService } from "../user/user.service";
import { User } from "../user/user.schema";
import { ValidateOtp } from 'src/user/validateotp';


@Injectable()
export class AuthService {
    constructor(
        private readonly UserService: UserService,
        private jwtService: JwtService,
        private readonly adminService: AdminService,
        private readonly otpService: OtpService,
        @InjectModel(AdminActivity.name) private AdminActivityModel: Model<AdminActivity>,
    ) { }

    /**
     * To decodeToken for getting user or admin id in the token
     * @param token
     * @returns
     */
    decodeToken(token: string): any {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            return decoded;
        } catch (error) {
            return null;
        }
    }

    /**
     * To validate user with mobile number
     * @param mobileNumber
     * @param createUserDto
     * @returns object
     */
    async validateUser(mobileNumber: string, createUserDto): Promise<User> {
        const result = await this.UserService.findAll(mobileNumber);
        const user = result.UserList[0];
        if (user) {
            return user;
        }
    }

    /**
     * To validate user with email id
     * @param email
     * @returns object
     */
    async validateUserByEmail(email: string): Promise<User> {
        const user = await this.UserService.findByEmail(email);
        if (!user) {
            throw new NotAcceptableException('Could not find the user');
        }
        return user;
    }

    /**
     * Admin login
     * @param createAdminDto
     * @returns object
     */
    async adminLogin(createAdminDto) {
        const result = await this.adminService.adminLogin(createAdminDto);
        if (!result) return false;

        const payload = await this.adminGeneratePayload(result);
        if (payload.role === "ADMIN" || payload.role === 'SUPER_ADMIN') {
            this.adminService.logAdminActivities({
                adminId: payload.id,
                action: 'admin_authenticated',
                activity: 'Admin Authenticated',
                reason: `Logged in`
            }).then(() => { });
        }
        return {
            user: result,
            token: this.jwtService.sign(payload)
        };
    }

    /**
     * Super admin change password
     * @param superAdminChangePasswordDto
     * @returns object
     */
    async superAdminChangePassword(superAdminChangePasswordDto: any) {
        const adminDetails = await this.adminService.findByIdValidate(superAdminChangePasswordDto.adminId);
        if (!adminDetails) {
            return false;
        }

        const currentPassword = adminDetails.password;
        const newPassword = superAdminChangePasswordDto.newPassword;
        const passwordsMatch = await bcrypt.compare(newPassword, currentPassword);
        if (passwordsMatch) {
            return { success: false };
        }

        const hashedPassword = await bcrypt.hash(newPassword, saltOrRounds);
        const updatedAdmin = {
            ...adminDetails,
            password: hashedPassword,
        };
        const updatedData = await this.adminService.AdminUpdate(updatedAdmin);
        return {
            success: true, data: {
                firstName: updatedData.firstName,
                lastName: updatedData.lastName,
                email: updatedData.email,
                mobileNumber: updatedData.mobileNumber
            }
        };
    }

    /**
     * User login OTP send old method (Note: we are not using this now)
     * @param loginDto
     * @returns object
     */
    async triggerUserLogin(loginDto: LoginDto) {
        return await this.UserService.generateUserOtp(loginDto);
    }

    /**
     * User login OTP send new method (Note: we use this one)
     * @param sendsmsOTP
     * @returns object
     */
    async smsOTP(sendsmsOTP: SendSMSOTP) {
        return await this.UserService.smsOTP(sendsmsOTP);
    }

    /**
     * Resend OTP method
     * @param resentOtp
     * @returns object
     */
    async resentOtp(resentOtp: ResendOtpDto) {
        return await this.UserService.resentOtp(resentOtp);
    }

    /**
     * verifyOTP old method (Note: we are not using this now)
     * @param otpDto
     * @returns object
     */
    async verifyOtp(otpDto: OtpDto) {
        const newUser = await this.UserService.validateUserOtp(otpDto);
        if (newUser) {
            const payload = await this.generatePayload(newUser);
            return {
                user: newUser,
                token: this.jwtService.sign(payload),
            };
        }
        return false;
    }

    /**
     * verifyOTP new method (Note: we use this one)
     * @param validateOtp
     * @returns object
     */
    async verifyOtpSMS(validateOtp: ValidateOtp) {
        const user = await this.UserService.validateUserSMSOtp(validateOtp);
        if (!user || user.status === 'INACTIVE') {
            return false;
        }
        const payload = await this.generatePayload(user);
        const token = this.jwtService.sign(payload);
        return {
            user,
            token,
        };
    }

    /**
     * To find admin details based on id
     * @param id
     * @param role
     * @returns object
     */
    async findById(id: string, role: string): Promise<any> {
        if (role === 'SUPER_ADMIN') {
            return await this.adminService.findById(id);
        } else if (role === 'ADMIN') {
            return await this.adminService.findById(id);
        }
        return null;
    }

    /**
     * Generate user payload once user logged in
     * @param userData
     * @returns object
     */
    async generatePayload(userData: any) {
        return {
            id: userData._id,
            fullName: userData.fullName,
            ownerName: userData.ownerName,
            mobileNumber: userData.mobileNumber,
            email: userData.email,
            profileImage: userData.profileImage,
            isExistUser: true,
            role: userData.role.role,
        }
    }

    /**
     * Generate admin user payload once admin logged in
     * @param userData
     * @returns object
     */
    async adminGeneratePayload(userData: any) {
        return {
            id: userData._id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            mobileNumber: userData.mobileNumber,
            email: userData.email,
            profileImage: userData.profileImage,
            role: userData.role.role,
        }
    }
}