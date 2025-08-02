import { Body, Controller, Get, Post, Query, Res, BadRequestException, Param, Put, Delete, UseGuards, Request, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { BulkUploadFileDto, CreateUserDto } from './dto/createUser.dto';
import { UpdatedUserDto } from './dto/updateUser.dto';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../multer.config';
import { appConst } from '../libs/constants';
import { ServiceProviderSupplierMillerAdminGuard, AdminGuard, JwtAuthGuard, ServiceProviderSupplierMiller } from 'src/auth/jwt-auth.guard';
const { ERROR, SUCCESS } = appConst;
import { VALIDATE_USER } from '../libs/constants';
import * as _ from 'lodash';
import { Cron, CronExpression } from '@nestjs/schedule';
import { verifyAndExtractToken } from 'src/utill/utill';
import { UpdatedUserProfileDto } from './dto/updateProfile.dto';
import { MillEnquiryDto } from './dto/millEnquiry.dto'; 


@ApiTags('User')
@Controller('User')
export class UserController {
    constructor(
        private readonly UserService: UserService,
        private readonly responseService: ResponseService,
    ) { }

    @UseGuards(AdminGuard)
    @ApiBearerAuth()
    @Post()
    async create(@Body() createUserDto: CreateUserDto, @Request() req, @Res() res: any) {
        try {
            if (createUserDto.email?.trim() === '') {
                createUserDto.email = undefined;
            }
            const existingUser = await this.UserService.findUserForExistance(createUserDto);
            let code = '';
            if (existingUser) {
                if (existingUser.email === createUserDto.email) {
                    code = '1025';
                }
                if (existingUser.mobileNumber === createUserDto.mobileNumber) {
                    code = '1059';
                } else if (existingUser.companyName === createUserDto.companyName) {
                    code = '1060';
                }
                if (code) {
                    this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code }, code);
                    return;
                }
            }

            const decodedToken = verifyAndExtractToken(req.headers);
            const createdUser = await this.UserService.create(createUserDto, decodedToken.id, decodedToken.role)
            if (createdUser) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1021',
                    data: {
                        _id: (createdUser as any).id,
                        createdAt: (createdUser as any).createdAt,
                    }
                }, '1021');
            }
            else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
            }
        }
        catch (e) {
            throw new BadRequestException();
        }
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post('millEnquiry')
    async sendProductRequest(@Body() enquiryDto: MillEnquiryDto, @Request() req: any, @Res() res: Response) {
        try {
            const decodedToken = verifyAndExtractToken(req.headers);
            if (decodedToken.id === enquiryDto.millerId) {
                const code = '1164';
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code }, code);
                return;
            }
            await this.UserService.sendProductRequest(enquiryDto);
            this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                code: '1165',
            }, '1165');
        } catch (e) {
            this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '400' }, '400');
        }
    }

    @UseGuards(AdminGuard)
    @ApiBearerAuth()
    @Post('bulkupload')
    @UseInterceptors(FileInterceptor('file', multerConfig))
    @ApiConsumes('multipart/form-data')
    @ApiBody({ description: 'Upload file', type: BulkUploadFileDto })
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Request() req: any,
        @Res() res: any,
    ) {

        const decodedToken = verifyAndExtractToken(req.headers);
        const { roleId, stateId, districtId, cityId } = req.body;
        const role = await this.UserService.findRoleById(roleId);

        if (role.role === VALIDATE_USER.MILLER) {
            const state = await this.UserService.findStateById(stateId);
            if (!state) {
                return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '5023' }, '5023');
            }
            const district = await this.UserService.findDistrictById(districtId);
            if (!district) {
                return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '5024' }, '5024');
            }
            const city = await this.UserService.findCityById(cityId);
            if (!city) {
                return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '5025' }, '5025');
            }
        } else if (role.role === VALIDATE_USER.SUPPLIER || role.role === VALIDATE_USER.SERVICE_PROVIDER) {
            const role = await this.UserService.findRoleById(roleId);
            if (!role) {
                return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '5022' }, '5022');
            }
            const state = await this.UserService.findStateById(stateId);
            if (!state) {
                return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '5023' }, '5023');
            }
        } else {
            return res.status(400).json({
                status: "error",
                message: "Invalid role or unsupported role.",
            });
        }
        // const role = await this.UserService.findRoleById(roleId);
        // if (!role) {
        //   return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '5022' }, '5022');
        // }
        // const state = await this.UserService.findStateById(stateId);
        // if (!state) {
        //   return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '5023' }, '5023');
        // }
        // const district = await this.UserService.findDistrictById(districtId);
        // if (!district) {
        //   return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '5024' }, '5024');
        // }
        // const city = await this.UserService.findCityById(cityId);
        // if (!city) {
        //   return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '5025' }, '5025');
        // }
        if (!file) {
            return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '5014' }, '5014');
        }
        const filePath = file.path;
        const fileExtension = filePath.split('.').pop();

        if (fileExtension !== 'xlsx' && fileExtension !== 'csv') {
            return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '5014' }, '5014');
        }
        try {
            const result: any = await this.UserService.parseFile(filePath, decodedToken.id, decodedToken.role, roleId, stateId, districtId, cityId);
            if (result.status === 'success') {
                return this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: result.code, data: result.data }, result.code);
            } else {
                return this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: result.code, data: result.data }, result.code);
            }
        } catch (e) {
            console.log("Error:", e);
            this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
        }
    }

    @UseGuards(ServiceProviderSupplierMiller)
    @ApiBearerAuth()
    @Get('profile')
    async getUserProfile(@Request() req: any, @Res() res: any) {
        try {
            const decodedToken = verifyAndExtractToken(req.headers);
            const getUserProfile = await this.UserService.findUserProfileById(decodedToken.id);
            if (getUserProfile) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1004',
                    data: getUserProfile
                }, '1004');
            } else {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005' }, '1005');
            }
        } catch (e) {
            this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
        }
    }

    @UseGuards(ServiceProviderSupplierMiller)
    @ApiBearerAuth()
    @Put('profile')
    async userProfileUpdate(@Body() UpdateUserDto: UpdatedUserProfileDto, @Request() req: any, @Res() res: any) {
        try {
            const decodedToken = verifyAndExtractToken(req.headers);
            const existingUser = await this.UserService.findUserForExistanceButIdProfile(decodedToken.id, UpdateUserDto);
            let code = '';
            if (existingUser) {
                if (existingUser.email === UpdateUserDto.email) code = '1048';
                else if (existingUser.mobileNumber === UpdateUserDto.mobileNumber) code = '1149';
                if (code) {
                    this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code }, code);
                    return;
                }
            }
            const updateUser = await this.UserService.updateUserModel(decodedToken.id, UpdateUserDto, decodedToken.role);
            if (!_.isEmpty(updateUser)) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1006',
                    data: {
                        _id: (updateUser as any).id,
                        updatedAt: (updateUser as any).updatedAt,
                    }
                }, '1006');
            } else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.SUCCESS_REQUEST, { code: '1005' }, '1005');
            }
        } catch (e) {
            this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
        }
    }

    @UseGuards(ServiceProviderSupplierMillerAdminGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'productName', required: false, description: 'Return Based on product name' })
    @ApiQuery({ name: 'categoryId', required: false, description: 'Filters by city using category id.', type: [String] })
    @ApiQuery({ name: 'subcategoryId', required: false, description: 'Filters by using subcategory id.', type: [String] })
    @ApiQuery({ name: 'ownerName', required: false, description: 'Return Based on owner name' })
    @ApiQuery({ name: 'whatappno', required: false, description: 'Return Based on whatappno' })
    @ApiQuery({ name: 'manufacturer', required: false, description: 'Return Based on manufacturer Id' })
    @ApiQuery({ name: 'companyMobileNo', required: false, description: 'Return Based on company mobile no' })
    @ApiQuery({ name: 'companyEmail', required: false, description: 'Return Based on company email' })
    @ApiQuery({ name: 'supplierName', required: false, description: 'Return Based on suppliername' })
    @ApiQuery({ name: 'status', required: false, description: 'Return Based on status' })
    @ApiQuery({ name: 'cityId', required: false, description: 'Filters by city using city id.', type: [String] })
    @ApiQuery({ name: 'stateId', required: false, description: 'Filters by using state id.', type: [String] })
    @ApiQuery({ name: 'districtId', required: false, description: 'Filters by using district id.', type: [String] })
    @ApiQuery({ name: 'role', required: false, description: 'Return Based on role' })
    @ApiQuery({ name: 'contactPerson', required: false, description: 'Return Based on contactPerson' })
    @ApiQuery({ name: 'companyName', required: false, description: 'Return Based on company name' })
    @ApiQuery({ name: 'mobileNumber', required: false, description: 'Return Based on mobileNumber' })
    @ApiQuery({ name: 'email', required: false, description: 'Return Based on email' })
    @ApiQuery({ name: 'fullName', required: false, description: 'Return Based on fullName' })
    @ApiQuery({ name: 'checkCommitee', type: 'string', required: false })
    @Get()
    async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any, @Request() req) {
        const decodedToken = verifyAndExtractToken(req.headers);
        try {
            const result = await this.UserService.findAll(queryParams);
            if (!_.isEmpty(result && result.UserList)) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1004',
                    data: result.UserList,
                    count: result.count
                }, '1004');
            }
            else {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: result.count }, '1005')
            }
        } catch {
            throw new BadRequestException();
        }
    }

    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @Get('committeeMember')
    async findAllCommitterMember(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any, @Request() req) {
        try {
            const result = await this.UserService.findAllCommittee(queryParams);
            if (!_.isEmpty(result && result.CommitteeMemberList)) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1004',
                    data: result.CommitteeMemberList,
                    count: result.count
                }, '1004');
            }
            else {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: result.count }, '1005')
            }
        } catch {
            throw new BadRequestException();
        }
    }

    @UseGuards(ServiceProviderSupplierMillerAdminGuard)
    @ApiBearerAuth()
    @Get(':id')
    async findById(@Param('id') id: string, @Request() req, @Res() res: any) {
        try {
            const decodedToken = verifyAndExtractToken(req.headers);
            const getByStudent = await this.UserService.findById(id, decodedToken.id, decodedToken.role)
            if (getByStudent) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1004',
                    data: getByStudent
                }, '1004');
            } else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1005' }, '1005');
            }
        } catch {
            throw new BadRequestException();
        }
    }

    @UseGuards(ServiceProviderSupplierMillerAdminGuard)
    @ApiBearerAuth()
    @Get('myactivities/:userId')
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    async findMyActivityById(@Param('userId') userId: string, @Res() res: any, @Query() queryParams) {
        try {
            const getUserActivites = await this.UserService.findMyActivityById(userId, queryParams)
            if (!_.isEmpty(getUserActivites.userActivities)) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1004',
                    data: getUserActivites.userActivities,
                    count: getUserActivites.count
                }, '1004');
            } else {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1004', data: [], count: getUserActivites.count }, '1004');
            }
        } catch {
            this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
        }
    }

    @UseGuards(AdminGuard)
    @ApiBearerAuth()
    @Put(':id')
    async update(@Param('id') id: string, @Body() updatedUserDto: UpdatedUserDto, @Request() req, @Res() res: any) {
        try {
            if (updatedUserDto.email?.trim() === '') {
                updatedUserDto.email = undefined;
            }
            const existingUser = await this.UserService.findUserForExistanceButId(id, updatedUserDto);
            let code = '';
            if (existingUser) {
                if (existingUser.email === updatedUserDto.email) {
                    code = '1048';
                }
                if (existingUser.mobileNumber === updatedUserDto.mobileNumber) {
                    code = '1059';
                }
                if (existingUser.companyName === updatedUserDto.companyName) {
                    code = '1060';
                }
                if (code) {
                    this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code }, code);
                    return;
                }
            }
            const decodedToken = verifyAndExtractToken(req.headers);

            const updateStudent = await this.UserService.update(id, updatedUserDto, decodedToken.id, decodedToken.role);

            if (updateStudent) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1022',
                    data: {
                        _id: (updateStudent as any).id,
                        updatedAt: (updateStudent as any).updatedAt,
                    },
                }, '1022');
            } else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1005' }, '1005');
            }
        } catch (e) {
            console.error('Update error:', e);
            throw new BadRequestException();
        }
    }


    @UseGuards(AdminGuard)
    @ApiBearerAuth()
    @Delete(':id')
    async delete(@Param('id') id: string, @Request() req, @Res() res: any) {
        try {
            const decodedToken = verifyAndExtractToken(req.headers);
            const deleteUser = await this.UserService.delete(id, decodedToken);
            if (deleteUser) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1023', data: { _id: (deleteUser as any).id } }, '1023');
            }
            else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1005' }, '1005');
            }
        } catch {
            throw new BadRequestException();
        }
    }

    // @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    // async handleMemberInactiveCron() {
    //   await this.UserService.memberInactiveCron();
    // }
}