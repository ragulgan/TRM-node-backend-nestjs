import { Controller, Post, UseGuards, Body, Res, Query, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiBody, ApiBearerAuth, ApiQuery, } from '@nestjs/swagger';
import { LoginDto, OtpDto, AdminDto, CreateAdminDto, SuperAdminChangePasswordDto, SendSMSOTP, ResendOtpDto } from './dto/logindto';
import { ResponseService } from '../base/controller';
import { appConst } from '../libs/constants';
import { AdminGuard, SuperAdminGuard } from './jwt-auth.guard';
import { decodeJWTToken, validateOtpFactor } from '../utill/utill';
const { ERROR, SUCCESS } = appConst;
import { ValidateOtp } from 'src/user/validateotp';
import { Otp } from 'src/otp/otp.schema';
import { InjectModel, } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/user/user.schema';

@ApiTags('Auth')
@Controller('auth/')
export class AuthController {
    constructor(
        private authService: AuthService,
        private readonly responseService: ResponseService,
        @InjectModel(ValidateOtp.name) private validateOtpModel: Model<ValidateOtp>,
    ) { }

    @Post('login/user')
    @ApiBody({ type: LoginDto })
    async loginSupplier(@Body() loginDto: LoginDto, @Res() res) {
        const result = await this.authService.triggerUserLogin(loginDto);
        if (result === 'INACTIVE') {
            return this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                code: '1441'
            }, '1441');
        }
        if (result === 'OTP_FAILED') {
            return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '5029' }, '5029');
        }
        if (result === 'SUCCESS') {
            return this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                code: '1008'
            }, '1008');
        } else if (result === 'LOGIN_FROM_DIFFERENT_DEVICE') {
            return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '2001' }, '2001');
        } else {
            return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1009' }, '1009');
        }
    }

    @Post('validate/otp')
    @ApiBody({ type: OtpDto })
    async verifySupplier(@Body() otpDto: OtpDto, @Res() res) {
        const result: any = await this.authService.verifyOtp(otpDto);
        if (!result) {
            return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1009' }, '1009');
        }
        if (result && result.user && result?.user?.status == 'INACTIVE') {
            return this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                code: '1441'
            }, '1441');
        }
        if (result) {
            return this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                code: '1001',
                data: {
                    id: result.user._id,
                    fullName: result.user.fullName,
                    ownerName: result.user.ownerName,
                    profileImage: result.user.profileImage,
                    mobileNumber: result.user.mobileNumber,
                    role: result.user.role,
                    status: result.user.status,
                    token: result.token
                }
            }, '1001');
        }
    }

    @Post('login/admin')
    @ApiBody({ type: AdminDto })
    async Admin(@Body() createAdminDto: CreateAdminDto, @Res() res) {
        const result = await this.authService.adminLogin(createAdminDto);
        if (result) {
            this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                code: '1014',
                data: {
                    id: result.user._id,
                    firstName: result.user.firstName,
                    lastName: result.user.lastName,
                    profileImage: result.user.profileImage,
                    mobileNumber: result.user.mobileNumber,
                    email: result.user.email,
                    role: result.user.role.role,
                    status: result.user.status,
                    token: result.token
                }
            }, '1014');
        } else {
            this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1018' }, '1018');
        }
        return result;
    }

    @UseGuards(SuperAdminGuard)
    @ApiBearerAuth()
    @Post('superAdmin/adminChangepassword')
    @ApiBody({ type: SuperAdminChangePasswordDto })
    async superAdminChangePassword(@Body() superAdminChangePasswordDto: SuperAdminChangePasswordDto, @Res() res) {
        const result = await this.authService.superAdminChangePassword(superAdminChangePasswordDto);
        try {
            if (typeof result === 'object' && result.success) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '2004',
                    data: result.data
                }, '2004');
            } else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '4303' }, '4303');
            }
        } catch {
            this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
        }
    }

    @Post('sendsms/otp')
    @ApiBody({ type: SendSMSOTP })
    async SMS(@Body() sendsmsOTP: SendSMSOTP, @Res() res) {
        const result = await this.authService.smsOTP(sendsmsOTP);
        if (result === 'INACTIVE') {
            return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, {
                code: '1441',
            }, '1441');
        }
        if (result === 'USER_NOT_FOUND') {
            return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, {
                code: '5028',
            }, '5028');
        }
        if (result === 'OTP_FAILED') {
            return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, {
                code: '5029',
            }, '5029');
        }
        if (result === 'SUCCESS') {
            return this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                code: '1008',
            }, '1008');
        } else {
            return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, {
                code: '1009',
            }, '1009');
        }
    }

    // @ApiQuery({ name: 'code', required: true, description: 'OTP code to validate' })
    // @ApiQuery({ name: 'mobileNumber', required: true, description: 'Mobile number to validate OTP' })
    // @Get('validate/smsotp')
    // async verificationOTP(
    //   @Query() queryParams: { mobileNumber: string; code: string },
    //   @Res() res: any,
    // ) {
    //   const { mobileNumber, code } = queryParams;

    //   try {
    //     const otpValidationResponse = await validateOtpFactor(mobileNumber, code);
    //     if (otpValidationResponse?.data?.Status !== 'Success') {
    //       return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, {
    //         code: '5029'
    //       },
    //         '5029'
    //       );
    //     }
    //     const validateOtp = new ValidateOtp();
    //     validateOtp.mobileNumber = mobileNumber;
    //     const result = await this.authService.verifyOtpSMS(validateOtp);
    //     if (!result || !result.user) {
    //       return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, {
    //         code: '5030'
    //       },
    //         '5030'
    //       );
    //     }
    //     return this.responseService.sendResponse(
    //       {},
    //       res,
    //       SUCCESS.CODE,
    //       {
    //         code: '1001',
    //         data: {
    //           id: result.user._id,
    //           ownerName: result.user.ownerName,
    //           profileImage: result.user.profileImage,
    //           mobileNumber: result.user.mobileNumber,
    //           role: result.user.role,
    //           status: result.user.status,
    //           token: result.token,
    //         },
    //       },
    //       'OTP verified successfully'
    //     );
    //   } catch (error) {
    //     console.error('Error in verificationOTP:', error.message);
    //   }
    // }

    @ApiQuery({ name: 'code', required: true, description: 'OTP code to validate' })
    @ApiQuery({ name: 'mobileNumber', required: true, description: 'Mobile number to validate OTP' })
    @Get('validate/smsotp')
    async verificationOTP(
        @Query() queryParams: { mobileNumber: string; code: string },
        @Res() res: any
    ) {
        const { mobileNumber, code } = queryParams;

        try {
            // 1️ Static OTP Flow
            console.log("Checking Static OTP Flow...");
            const otpDto: OtpDto = { mobileNumber, otp: code };

            const staticOtpResult = await this.authService.verifyOtp(otpDto);
            if (staticOtpResult) {
                return this.handleOtpResponse(staticOtpResult, res, 'OTP Verified Successfully');
            }

            // 2️ Dynamic OTP Flow
            console.log("Proceeding with Dynamic OTP Flow...");
            const otpValidationResponse = await validateOtpFactor(mobileNumber, code);

            if (otpValidationResponse?.data?.Status !== 'Success') {
                return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '5029' }, '5029');
            }

            const validateOtp = { mobileNumber } as ValidateOtp;
            const dynamicOtpResult = await this.authService.verifyOtpSMS(validateOtp);

            if (!dynamicOtpResult) {
                return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1009' }, 'Invalid OTP');
            }

            return this.handleOtpResponse(dynamicOtpResult, res, 'OTP Verified Successfully');

        } catch (error) {
            console.error('Error during OTP verification:', error);
            return this.responseService.sendResponse({}, res, ERROR.SERVER_ERROR.INTERNAL_SERVER_ERROR, { code: '5000' }, 'Server Error');
        }
    }

    private async handleOtpResponse(result: any, res: any, successMessage: string) {
        if (result && result.user && result.user.status === 'INACTIVE') {
            return this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1441' }, 'User Inactive');
        }

        if (result) {
            return this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                code: '1001',
                data: {
                    id: result.user._id,
                    fullName: result.user.fullName,
                    ownerName: result.user.ownerName,
                    profileImage: result.user.profileImage,
                    mobileNumber: result.user.mobileNumber,
                    role: result.user.role,
                    status: result.user.status,
                    token: result.token
                }
            }, successMessage);
        }
        return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1009' }, 'Invalid OTP');
    }

    @Post('resendOtp')
    async resendOtp(
        @Body() resendOtp: ResendOtpDto,
        @Res() res: any
    ) {
        try {
            const otp = await this.authService.resentOtp(resendOtp)
            if (otp === 'INACTIVE') {
                return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, {
                    code: '1441',
                }, '1441');
            }
            if (otp === 'USER_NOT_FOUND') {
                return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, {
                    code: '5028',
                }, '5028');
            }
            if (otp === 'OTP_FAILED') {
                return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, {
                    code: '5029',
                }, '5029');
            }
            if (otp === 'SUCCESS') {
                return this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '5026',
                }, '5026');
            } else {
                return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, {
                    code: '1009',
                }, '1009');
            }
        } catch (error) {
            console.error('[Resend OTP]:', error.message);
        }
    }

}