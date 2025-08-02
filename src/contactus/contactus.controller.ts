import { BadRequestException, Body, Controller, Get, Param, Post, Put, Delete, Query, Res, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { ContactUsService } from "./contactus.service";
import { ResponseService } from "src/base/controller";
import { ContactUsDto } from "./dto/contactus.dto";
import { appConst } from '../libs/constants';
import { AdminGuard } from "src/auth/jwt-auth.guard";
import { UpdateContactUsDto } from "./dto/contactusUpdate.dto";
const { ERROR, SUCCESS } = appConst;

@ApiTags('contactus')
@Controller('contactus')
export class ContactUsController {
    constructor(
        private readonly contactUsService: ContactUsService,
        private readonly responseService: ResponseService,
    ) { }

    @Post()
    async create(@Body() contactUsDto: ContactUsDto, @Res() res: Response) {
        try {
            const saved = await this.contactUsService.saveContactRequest(contactUsDto);
            if (saved) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1107',
                    data: {
                        _id: (saved as any).id,
                        createdAt: (saved as any).createdAt,
                    }
                }, '1107');
            }
            else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '400' }, '400');
            }
        } catch (e) {
            throw new BadRequestException();
        }
    }

    @UseGuards(AdminGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'page', required: false, })
    @ApiQuery({ name: 'limit', required: false, })
    @ApiQuery({ name: 'createdAt', required: false, description: 'Filter by createdAt' })
    @ApiQuery({ name: 'enquiryStatus', required: false, description: 'Filter by enquiry Status' })
    @ApiQuery({ name: 'role', required: false, description: 'Filter by role' })
    @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
    @ApiQuery({ name: 'mobileNumber', required: false, description: 'Filter by mobile number' })
    @ApiQuery({ name: 'email', required: false, description: 'Filter by email' })
    @ApiQuery({ name: 'name', required: false, description: 'Filter by name' })
    @Get()
    async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
        try {
            const messageData = await this.contactUsService.findAll(queryParams);
            if (messageData && messageData.messages.length) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1004',
                    data: messageData.messages,
                    count: messageData.count
                }, '1004');
            }
            else {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: messageData.count }, '1005')
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
            const getByStudent = await this.contactUsService.findById(id)
            if (getByStudent) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1004',
                    data: getByStudent
                }, '1004');
            } else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1168' }, '1168');
            }
        } catch {
            throw new BadRequestException();
        }
    }

    @UseGuards(AdminGuard)
    @ApiBearerAuth()
    @Put(':id')
    async update(@Param('id') id: string, @Body() updatedContactUsDto: UpdateContactUsDto, @Res() res: any) {
        try {
            const updateStudent = await this.contactUsService.update(id, updatedContactUsDto);
            if (updateStudent) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1166',
                    data: {
                        _id: (updateStudent as any).id,
                        updatedAt: (updateStudent as any).updatedAt,
                    }
                }, '1166');
            } else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1168' }, '1168');
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
            const deleteContactUs = await this.contactUsService.delete(id);
            if (deleteContactUs) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1169', data: { _id: (deleteContactUs as any).id } }, '1169');
            }
            else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1168' }, '1168');
            }
        } catch {
            throw new BadRequestException();
        }
    }
}