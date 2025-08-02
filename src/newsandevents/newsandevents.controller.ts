import { Body, Controller, Get, Post, Query, Res, BadRequestException, Param, Put, Delete, UseGuards, Request } from '@nestjs/common';
import { NewsAndEventsService } from './newsandevents.service';
import { CreateNewsAndEventsDto } from './dto/createNewsAndEvents.dto';
import { UpdatedNewsAndEventsDto } from './dto/updateNewsAndEvents.dto';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { AdminGuard, JwtAuthGuard, } from 'src/auth/jwt-auth.guard';
const { ERROR, SUCCESS } = appConst;
import * as _ from 'lodash';

@ApiTags('NewsAndEvents')
@Controller('NewsAndEvents')
export class NewsAndEventsController {
    constructor(
        private readonly NewsAndEventsService: NewsAndEventsService,
        private readonly responseService: ResponseService,
    ) { }

    @UseGuards(AdminGuard)
    @ApiBearerAuth()
    @Post()
    async create(@Body() createNewsAndEventsDto: CreateNewsAndEventsDto, @Res() res: Response) {
        try {
            const createdNewsAndEvents = await this.NewsAndEventsService.create(
                createNewsAndEventsDto
            )
            if (createdNewsAndEvents) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1034',
                    data: {
                        _id: (createdNewsAndEvents as any).id,
                        createdAt: (createdNewsAndEvents as any).createdAt,
                    }
                }, '1034');
            }
            else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
            }
        }
        catch (e) {
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
    async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any, @Request() req) {
        try {
            const result = await this.NewsAndEventsService.findAll(queryParams);
            if (!_.isEmpty(result && result.NewsAndEventsList)) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1004',
                    data: result.NewsAndEventsList,
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

    @ApiQuery({ name: 'page', required: false, })
    @ApiQuery({ name: 'limit', required: false, })
    @Get('/webnewseventlist')
    async findAllAscending(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any, @Request() req) {
        try {
            const result = await this.NewsAndEventsService.findAllAscending(queryParams);
            if (!_.isEmpty(result && result.NewsAndEventsList)) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1004',
                    data: result.NewsAndEventsList,
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

    // @UseGuards(JwtAuthGuard)
    // @ApiBearerAuth()
    @Get(':id')
    async findById(@Param('id') id: string, @Res() res: any) {
        try {
            const getByStudent = await this.NewsAndEventsService.findById(id)
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

    @UseGuards(AdminGuard)
    @ApiBearerAuth()
    @Put(':id')
    async update(@Param('id') id: string, @Body() updatedNewsAndEventsDto: UpdatedNewsAndEventsDto, @Res() res: any) {
        try {
            const updateStudent = await this.NewsAndEventsService.update(id, updatedNewsAndEventsDto);
            if (updateStudent) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1035',
                    data: {
                        _id: (updateStudent as any).id,
                        updatedAt: (updateStudent as any).updatedAt,
                    }
                }, '1035');
            } else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1005' }, '1005');
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
            const deleteNewsAndEvents = await this.NewsAndEventsService.delete(id);
            if (deleteNewsAndEvents) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1036', data: { _id: (deleteNewsAndEvents as any).id } }, '1036');
            }
            else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1005' }, '1005');
            }
        } catch {
            throw new BadRequestException();
        }
    }

}