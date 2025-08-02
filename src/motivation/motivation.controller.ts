import { Body, Controller, Get, Post, Query, Res, BadRequestException, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { MotivationService } from './motivation.service';
import { CreateMotivationDto } from './dto/createMotivation.dto';
import { UpdatedMotivationDto } from './dto/updateMotivation.dto';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { JwtAuthGuard, AdminGuard } from 'src/auth/jwt-auth.guard';
const { ERROR, SUCCESS } = appConst;
import * as _ from 'lodash';

@ApiTags('Motivation')
@Controller('motivation')
export class MotivationController {
    constructor(
        private readonly motivationService: MotivationService,
        private readonly responseService: ResponseService,
    ) { }

    @UseGuards(AdminGuard)
    @ApiBearerAuth()
    @Post()
    async create(@Body() createMotivationDto: CreateMotivationDto, @Res() res: Response) {
        try {
            const exist = await this.motivationService.findByName(createMotivationDto.title);
            const existMessage = await this.motivationService.findByMessage(createMotivationDto.message);
            if (exist || existMessage) {
                const code = '1097';
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code }, code);
                return;
            }
            const createdState = await this.motivationService.create(createMotivationDto);
            if (createdState) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1093',
                    data: {
                        _id: (createdState as any).id,
                        createdAt: (createdState as any).createdAt,
                    }
                }, '1093');
            }
            else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
            }
        } catch (e) {
            console.log('e====>', e)
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
            const getState = await this.motivationService.findAll(queryParams);
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
    @Get('/webmotivationlist')
    async findAllAscending(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
        try {
            const getState = await this.motivationService.findAllAscending(queryParams);
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

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Get(':id')
    async findById(@Param('id') id: string, @Res() res: any) {
        try {
            const getByStudent = await this.motivationService.findById(id)
            if (getByStudent) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1004',
                    data: getByStudent
                }, '1004');
            } else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1096' }, '1096');
            }
        } catch {
            throw new BadRequestException();
        }
    }

    @UseGuards(AdminGuard)
    @ApiBearerAuth()
    @Put(':id')
    async update(@Param('id') id: string, @Body() updatedStateDto: UpdatedMotivationDto, @Res() res: any) {
        try {
            const exist = await this.motivationService.findByNameButId(updatedStateDto.title, id);
            const existMessage = await this.motivationService.findByMessageButId(updatedStateDto.message, id);
            if (exist || existMessage) {
                const code = '1097';
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code }, code);
                return;
            }
            const updateStudent = await this.motivationService.update(id, updatedStateDto);
            if (updateStudent) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1094',
                    data: {
                        _id: (updateStudent as any).id,
                        updatedAt: (updateStudent as any).updatedAt,
                    }
                }, '1094');
            } else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1096' }, '1096');
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
            const deleteState = await this.motivationService.delete(id);
            if (deleteState) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1095', data: { _id: (deleteState as any).id } }, '1095');
            }
            else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1096' }, '1096');
            }
        } catch {
            throw new BadRequestException();
        }
    }
}