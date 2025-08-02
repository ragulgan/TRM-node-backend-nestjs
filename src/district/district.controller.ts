import { Body, Controller, Get, Post, Query, Res, BadRequestException, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { DistrictService } from './district.service';
import { CreateDistrictDto } from './dto/createDistrict.dto';
import { UpdatedDistrictDto } from './dto/updateDistrict.dto';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { JwtAuthGuard, AdminGuard } from 'src/auth/jwt-auth.guard';
const { ERROR, SUCCESS } = appConst;
import * as _ from 'lodash';

@ApiTags('District')
@Controller('district')
export class DistrictController {
    constructor(
        private readonly DistrictService: DistrictService,
        private readonly responseService: ResponseService,
    ) { }

    @UseGuards(AdminGuard)
    @ApiBearerAuth()
    @Post()
    async create(@Body() createStateDto: CreateDistrictDto, @Res() res: Response) {
        try {
            const exist = await this.DistrictService.findByName(createStateDto.districtName);
            if (exist) {
                const code = '1167';
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code }, code);
                return;
            }
            const createdState = await this.DistrictService.create(createStateDto);
            if (createdState) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1067',
                    data: {
                        _id: (createdState as any).id,
                        createdAt: (createdState as any).createdAt,
                    }
                }, '1067');
            }
            else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
            }
        } catch (e) {
            throw new BadRequestException();
        }
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'page', required: false, })
    @ApiQuery({ name: 'limit', required: false, })
    @ApiQuery({ name: 'status', required: false, description: 'Return Based on status' })
    @ApiQuery({ name: 'districtName', required: false, description: 'Return Based on districtName' })
    @ApiQuery({ name: 'stateId', required: false, description: 'Return Based on stateId' })
    @Get()
    async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
        try {
            const getState = await this.DistrictService.findAll(queryParams);
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
            const getByStudent = await this.DistrictService.findById(id)
            if (getByStudent) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1004',
                    data: getByStudent
                }, '1004');
            } else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1070' }, '1070');
            }
        } catch {
            throw new BadRequestException();
        }
    }

    @UseGuards(AdminGuard)
    @ApiBearerAuth()
    @Put(':id')
    async update(@Param('id') id: string, @Body() updatedStateDto: UpdatedDistrictDto, @Res() res: any) {
        try {
            const exist = await this.DistrictService.findByNameButId(updatedStateDto.districtName, id);
            if (exist) {
                const code = '1167';
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code }, code);
                return;
            }
            const updateStudent = await this.DistrictService.update(id, updatedStateDto);
            if (updateStudent) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1068',
                    data: {
                        _id: (updateStudent as any).id,
                        updatedAt: (updateStudent as any).updatedAt,
                    }
                }, '1068');
            } else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1070' }, '1070');
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
            const deleteState = await this.DistrictService.delete(id);
            if (deleteState) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1069', data: { _id: (deleteState as any).id } }, '1069');
            }
            else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1070' }, '1070');
            }
        } catch {
            throw new BadRequestException();
        }
    }
}