import { Body, Controller, Get, Post, Query, Res, BadRequestException, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { CreatePromotioDto } from './dto/createPromotion.dto';
import { UpdatedPromotioDto } from './dto/updatePromotion.dto';
import { AdvertisementEnquiryDto } from './dto/advertisementEnquiry.dto'
import { UpdateAdvertiseEnquiryDto } from './dto/advertisementEnquiryUpdate.dto'
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { JwtAuthGuard, AdminGuard } from '../auth/jwt-auth.guard';
const { ERROR, SUCCESS } = appConst;
import * as _ from 'lodash';

@ApiTags('Advertisement')
@Controller('promotion')
export class PromotionController {

  constructor(
    private readonly promotionService: PromotionService,
    private readonly responseService: ResponseService,
  ) { }

    @UseGuards(AdminGuard)
    @ApiBearerAuth()
    @Post()
    async create(@Body() createMotivationDto: CreatePromotioDto, @Res() res: Response) {
        try {
            const exist = await this.promotionService.findByName(createMotivationDto.addTitle);
            const existdescription = await this.promotionService.findByDescription(createMotivationDto.description);
            if (exist || existdescription) {
                const code = '1102';
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code }, code);
                return;
            }
            const createdState = await this.promotionService.create(createMotivationDto);
            if (createdState) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1098',
                    data: {
                        _id: (createdState as any).id,
                        createdAt: (createdState as any).createdAt,
                    }
                }, '1098');
            }
            else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
            }
        } catch (e) {
            console.log('e====>', e)
            throw new BadRequestException();
        }
    }

    @Post('advertisementEnquiry')
    async createPromotionEnquiry(@Body() advertiseEnquiryDto: AdvertisementEnquiryDto, @Res() res: Response) {
        try {
            const saved = await this.promotionService.createAdvertisementEnquiry(advertiseEnquiryDto);
            if (saved) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1170',
                    data: {
                        _id: (saved as any).id,
                        createdAt: (saved as any).createdAt,
                    }
                }, '1170');
            }
            else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '400' }, '400');
            }
        } catch (e) {
            throw new BadRequestException();
        }
    }

    // @UseGuards(JwtAuthGuard)
    // @ApiBearerAuth()
    @ApiQuery({ name: 'page', required: false, })
    @ApiQuery({ name: 'limit', required: false, })
    @ApiQuery({ name: 'status', required: false, description: 'Return Based on status' })
    @ApiQuery({ name: 'title', required: false, description: 'Return Based on title' })
    @Get()
    async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
        try {
            const getState = await this.promotionService.findAll(queryParams);
            if (!_.isEmpty(getState.StateList)) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1004',
                    data: getState.StateList,
                    count: getState.count
                }, '1004');
            }
            else {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getState.count }, '1005')
            }
        } catch {
            throw new BadRequestException();
        }
    }

    @ApiQuery({ name: 'page', required: false, })
    @ApiQuery({ name: 'limit', required: false, })
    @Get('webadvertisement')
    async findAllAscending(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
        try {
            const getState = await this.promotionService.findAllAscending(queryParams);
            if (!_.isEmpty(getState.StateList)) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1004',
                    data: getState.StateList,
                    count: getState.count
                }, '1004');
            }
            else {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getState.count }, '1005')
            }
        } catch {
            throw new BadRequestException();
        }
    }

    @UseGuards(AdminGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'page', required: false, })
    @ApiQuery({ name: 'limit', required: false, })
    @ApiQuery({ name: 'ownerName', required: false, description: 'Return Based on ownerName' })
    @ApiQuery({ name: 'fromEmail', required: false, description: 'Return Based on fromEmail' })
    @ApiQuery({ name: 'toEmail', required: false, description: 'Return Based on toEmail' })
    @ApiQuery({ name: 'mobileNumber', required: false, description: 'Return Based on mobileNumber' })
    @ApiQuery({ name: 'productOwnername', required: false, description: 'Return Based on productOwnername' })
    @ApiQuery({ name: 'productName', required: false, description: 'Return Based on productName' })
    @ApiQuery({ name: 'companyName', required: false, description: 'Return Based on companyName' })
    @ApiQuery({ name: 'district', required: false, description: 'Return Based on district' })
    @ApiQuery({ name: 'city', required: false, description: 'Return Based on city' })
    @ApiQuery({ name: 'status', required: false, description: 'Return Based on status' })
    @ApiQuery({ name: 'createdAt', required: false, description: 'Return Based on createdAt' })
    @ApiQuery({ name: 'role', required: false, description: 'Return Based on role' })
    @Get('advertisementEnquiry')
    async findAllAdvertisementEnquiry(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
        try {
            const getState = await this.promotionService.findAllAdvertisementEnquiry(queryParams);
            if (!_.isEmpty(getState.advertisementEnquiryList)) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1004',
                    data: getState.advertisementEnquiryList,
                    count: getState.count
                }, '1004');
            }
            else {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getState.count }, '1005')
            }
        } catch {
            throw new BadRequestException();
        }
    }

    @UseGuards(AdminGuard)
    @ApiBearerAuth()
    @Get('advertisementEnquiry/:id')
    async findByIdAdvertisementEnquiry(@Param('id') id: string, @Res() res: any) {
        try {
            const getByStudent = await this.promotionService.findByIdAdvertiseEnquiry(id)
            if (getByStudent) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1004',
                    data: getByStudent
                }, '1004');
            } else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1172' }, '1172');
            }
        } catch {
            throw new BadRequestException();
        }
    }


    @UseGuards(AdminGuard)
    @ApiBearerAuth()
    @Get(':id')
    async findById(@Param('id') id: string, @Res() res: any) {
        try {
            const getByStudent = await this.promotionService.findById(id)
            if (getByStudent) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1004',
                    data: getByStudent
                }, '1004');
            } else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1101' }, '1101');
            }
        } catch {
            throw new BadRequestException();
        }
    }

    @UseGuards(AdminGuard)
    @ApiBearerAuth()
    @Put(':id')
    async update(@Param('id') id: string, @Body() updatedStateDto: UpdatedPromotioDto, @Res() res: any) {
        try {
            const exist = await this.promotionService.findByNameButId(updatedStateDto.addTitle, id);
            const existdescription = await this.promotionService.findByNameButId(updatedStateDto.description, id);
            if (exist || existdescription) {
                const code = '1102';
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code }, code);
                return;
            }
            const updateStudent = await this.promotionService.update(id, updatedStateDto);
            if (updateStudent) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1099',
                    data: {
                        _id: (updateStudent as any).id,
                        updatedAt: (updateStudent as any).updatedAt,
                    }
                }, '1099');
            } else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1101' }, '1101');
            }
        } catch {
            throw new BadRequestException();
        }
    }

    @UseGuards(AdminGuard)
    @ApiBearerAuth()
    @Put('advertisementEnquiry/:id')
    async updateAdvertisementEnquiry(@Param('id') id: string, @Body() updatedAdvertisementEnquiryDto: UpdateAdvertiseEnquiryDto, @Res() res: any) {
        try {
            const updateStudent = await this.promotionService.updateAdvertisementEnquiry(id, updatedAdvertisementEnquiryDto);
            if (updateStudent) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                code: '1173',
                data: {
                        _id: (updateStudent as any).id,
                        updatedAt: (updateStudent as any).updatedAt,
                    }
                }, '1173');
            } else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1172' }, '1172');
            }
        } catch {
            throw new BadRequestException();
        }
    }

    @UseGuards(AdminGuard)
    @ApiBearerAuth()
    @Delete(':id')
    async delete(@Param('id') id: string, @Res() res: any) {
        try {
            const deleteState = await this.promotionService.delete(id);
            if (deleteState) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1100', data: { _id: (deleteState as any).id } }, '1100');
            }
            else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1101' }, '1101');
            }
        } catch {
            throw new BadRequestException();
        }
    }

    @UseGuards(AdminGuard)
    @ApiBearerAuth()
    @Delete('advertisementEnquiry/:id')
    async deleteAdvertisementEnquiry(@Param('id') id: string, @Res() res: any) {
        try {
            const deleteState = await this.promotionService.deleteAdvertiseEnquiry(id);
            if (deleteState) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1174', data: { _id: (deleteState as any).id } }, '1174');
            }
            else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1172' }, '1172');
            }
        } catch {
            throw new BadRequestException();
        }
    }

}