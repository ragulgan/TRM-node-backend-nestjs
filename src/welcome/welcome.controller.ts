import { Controller, Post, Body, Res, BadRequestException, UseGuards, Get, Query, Param, Put, Delete } from '@nestjs/common';
import { Response } from 'express';
import { AdminGuard, JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { WelcomeService } from './welcome.service';
import { ResponseService } from '../base/controller';
import { CreateWelcomeDto } from './dto/createWelcome.dto';
import { appConst } from 'src/libs/constants';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UpdatedWelcomeDto } from './dto/updateWelcome.dto ';
const { ERROR, SUCCESS } = appConst;
import * as _ from 'lodash';

@ApiTags('Welcome')
@Controller('welcome')
export class WelcomeController {

    constructor(
        private readonly welcomeService: WelcomeService,
        private readonly responseService: ResponseService
    ) { }

    @UseGuards(AdminGuard)
    @ApiBearerAuth()
    @Post()
    async create(@Body() createWelcomeDto: CreateWelcomeDto, @Res() res: Response) {
        try {
            const exist = await this.welcomeService.findByTitle(createWelcomeDto.title);
            if (exist) {
                const code = '1151';
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code }, code);
                return;
            }
            const createdWelcome = await this.welcomeService.create(createWelcomeDto);
            if (createdWelcome) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1104',
                }, '1104');
            } else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
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
    @ApiQuery({ name: 'bannerType', required: false, description: 'Return Based on banner type' })
    @Get()
    async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
        try {
            const getWelcome = await this.welcomeService.findAll(queryParams);
            if (!_.isEmpty(getWelcome && getWelcome.WelcomeList)) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1004',
                    data: getWelcome.WelcomeList,
                    count: getWelcome.count
                }, '1004');
            }
            else {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getWelcome.count }, '1005')
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
            const getByStudent = await this.welcomeService.findById(id)
            if (getByStudent) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1004',
                    data: getByStudent
                }, '1004');
            } else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
            }
        } catch {
            throw new BadRequestException();
        }
    }

    @UseGuards(AdminGuard)
    @ApiBearerAuth()
    @Put(':id')
    async update(@Param('id') id: string, @Body() updatedWelcomeDto: UpdatedWelcomeDto, @Res() res: any) {
        try {
            const exist = await this.welcomeService.findByTitleButId(updatedWelcomeDto.title, id);
            if (exist) {
                const code = '1151';
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code }, code);
                return;
            }
            const updateStudent = await this.welcomeService.update(id, updatedWelcomeDto);
            if (updateStudent) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1105',
                    data: {
                        _id: (updateStudent as any).id,
                        updatedAt: (updateStudent as any).updatedAt,
                    }
                }, '1105');
            } else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
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
            const deleteWelcome = await this.welcomeService.delete(id);
            if (deleteWelcome) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1106', data: { _id: (deleteWelcome as any).id } }, '1106');
            }
            else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
            }
        } catch {
            throw new BadRequestException();
        }
    }
}
