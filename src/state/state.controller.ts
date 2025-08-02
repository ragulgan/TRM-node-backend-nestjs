import { Body, Controller, Get, Post, Query, Res, BadRequestException, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { StateService } from './state.service';
import { CreateStateDto } from './dto/createState.dto';
import { UpdatedStateDto } from './dto/updateState.dto';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { JwtAuthGuard, AdminGuard } from 'src/auth/jwt-auth.guard';
const { ERROR, SUCCESS } = appConst;
import * as _ from 'lodash';

@ApiTags('State')
@Controller('state')
export class StateController {
    constructor(
        private readonly StateService: StateService,
        private readonly responseService: ResponseService,
    ) { }

    @UseGuards(AdminGuard)
    @ApiBearerAuth()
    @Post()
    async create(@Body() createCountryDto: CreateStateDto, @Res() res: Response) {
        try {
            const exist = await this.StateService.findByName(createCountryDto.stateName);
            if (exist) {
                const code = '1171';
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code }, code);
                return;
            }
            const createdCountry = await this.StateService.create(createCountryDto);
            if (createdCountry) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1071',
                    data: {
                        _id: (createdCountry as any).id,
                        createdAt: (createdCountry as any).createdAt,
                    }
                }, '1071');
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
    @ApiQuery({ name: 'stateName', required: false, description: 'Return Based on stateName' })
    @Get()
    async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
        try {
            const getCountry = await this.StateService.findAll(queryParams);
            if (!_.isEmpty(getCountry.CountryList)) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1004',
                    data: getCountry.CountryList,
                    count: getCountry.count
                }, '1004');
            }
            else {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getCountry.count }, '1005')
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
            const getByStudent = await this.StateService.findById(id)
            if (getByStudent) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1004',
                    data: getByStudent
                }, '1004');
            } else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1074' }, '1074');
            }
        } catch {
            throw new BadRequestException();
        }
    }

    @UseGuards(AdminGuard)
    @ApiBearerAuth()
    @Put(':id')
    async update(@Param('id') id: string, @Body() updatedCountryDto: UpdatedStateDto, @Res() res: any) {
        try {
            const exist = await this.StateService.findByNameButId(updatedCountryDto.stateName, id);
            if (exist) {
                const code = '1171';
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code }, code);
                return;
            }
            const updateStudent = await this.StateService.update(id, updatedCountryDto);
            if (updateStudent) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1072',
                    data: {
                        _id: (updateStudent as any).id,
                        updatedAt: (updateStudent as any).updatedAt,
                    }
                }, '1072');
            } else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1074' }, '1074');
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
            const deleteCountry = await this.StateService.delete(id);
            if (deleteCountry) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1073', data: { _id: (deleteCountry as any).id } }, '1073');
            }
            else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1074' }, '1074');
            }
        } catch {
            throw new BadRequestException();
        }
    }
}