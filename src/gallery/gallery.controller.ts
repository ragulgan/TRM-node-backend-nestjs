import { Body, Controller, Get, Post, Query, Res, BadRequestException, Param, Put, Delete, UseGuards, Request } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { CreateGalleryDto } from './dto/createGallery.dto';
import { UpdatedGalleryDto } from './dto/updateGallery.dto';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { AdminGuard, JwtAuthGuard, } from 'src/auth/jwt-auth.guard';
const { ERROR, SUCCESS } = appConst;
import * as _ from 'lodash';

@ApiTags('Gallery')
@Controller('gallery')
export class GalleryController {
    constructor(
        private readonly GalleryService: GalleryService,
        private readonly responseService: ResponseService,
    ) { }

    @UseGuards(AdminGuard)
    @ApiBearerAuth()
    @Post()
    async create(@Body() createGalleryDto: CreateGalleryDto, @Res() res: Response) {
        try {
            const exist = await this.GalleryService.findByName(createGalleryDto.title);
            if (exist) {
                const code = '1108';
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code }, code);
                return;
            }
            const createdGallery = await this.GalleryService.create(
                createGalleryDto
            )
            if (createdGallery) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1031',
                    data: {
                        _id: (createdGallery as any).id,
                        createdAt: (createdGallery as any).createdAt,
                    }
                }, '1031');
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
    @ApiQuery({ name: 'eventName', required: false, description: 'Return Based on event name' })
    @Get()
    async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any, @Request() req) {
        try {
            const result = await this.GalleryService.findAll(queryParams);
            if (!_.isEmpty(result && result.GalleryList)) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1004',
                    data: result.GalleryList,
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
    @Get('/webgallerylist')
    async findAllAscending(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any, @Request() req) {
        try {
            const result = await this.GalleryService.findAllAscending(queryParams);
            if (!_.isEmpty(result && result.GalleryList)) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1004',
                    data: result.GalleryList,
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


    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Get(':id')
    async findById(@Param('id') id: string, @Res() res: any) {
        try {
            const getByStudent = await this.GalleryService.findById(id)
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
    async update(@Param('id') id: string, @Body() updatedGalleryDto: UpdatedGalleryDto, @Res() res: any) {
        try {
            const exist = await this.GalleryService.findByNameButId(updatedGalleryDto.title, id);
            if (exist) {
                const code = '1108';
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code }, code);
                return;
            }
            const updateStudent = await this.GalleryService.update(id, updatedGalleryDto);
            if (updateStudent) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1032',
                    data: {
                        _id: (updateStudent as any).id,
                        updatedAt: (updateStudent as any).updatedAt,
                    }
                }, '1032');
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
            const deleteGallery = await this.GalleryService.delete(id);
            if (deleteGallery) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1033', data: { _id: (deleteGallery as any).id } }, '1033');
            }
            else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1005' }, '1005');
            }
        } catch {
            throw new BadRequestException();
        }
    }

}