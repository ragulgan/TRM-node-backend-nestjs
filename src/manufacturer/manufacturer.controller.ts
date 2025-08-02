import { Body, Controller, Get, Post, Query, Res, BadRequestException, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ManufacturerService } from './manufacturer.service';
import { CreateManufacturerDto } from './dto/createManufacturer.dto';
import { UpdatedManufacturerDto } from './dto/updateManufacturer.dto';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { JwtAuthGuard, AdminGuard } from 'src/auth/jwt-auth.guard';
const { ERROR, SUCCESS } = appConst;
import * as _ from 'lodash';

@ApiTags('Manufacturer')
@Controller('manufacturer')
export class ManufacturerController {
    constructor(
        private readonly ManufacturerService: ManufacturerService,
        private readonly responseService: ResponseService,
    ) { }

    @UseGuards(AdminGuard)
    @ApiBearerAuth()
    @Post()
    async create(@Body() createManufacturerDto: CreateManufacturerDto, @Res() res: Response) {
        try {
            const exist = await this.ManufacturerService.findByName(createManufacturerDto.name);
            if (exist) {
                const code = '1163';
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code }, code);
                return;
            }
            const createdManufacturer = await this.ManufacturerService.create(createManufacturerDto);
            if (createdManufacturer) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1159',
                    data: {
                        _id: (createdManufacturer as any).id,
                        createdAt: (createdManufacturer as any).createdAt,
                    }
                }, '1159');
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
    @ApiQuery({ name: 'name', required: false, description: 'Return Based on name' })
    @Get()
    async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
        try {
            const getManufacturer = await this.ManufacturerService.findAll(queryParams);
            if (!_.isEmpty(getManufacturer.ManufacturerList)) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1004',
                    data: getManufacturer.ManufacturerList,
                    count: getManufacturer.count
                }, '1004');
            }
            else {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: getManufacturer.count }, '1005')
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
            const getByManufacturer = await this.ManufacturerService.findById(id)
            if (getByManufacturer) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1004',
                    data: getByManufacturer
                }, '1004');
            } else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1082' }, '1082');
            }
        } catch {
            throw new BadRequestException();
        }
    }

    @UseGuards(AdminGuard)
    @ApiBearerAuth()
    @Put(':id')
    async update(@Param('id') id: string, @Body() updatedManufacturerDto: UpdatedManufacturerDto, @Res() res: any) {
        try {
            const exist = await this.ManufacturerService.findByNameButId(updatedManufacturerDto.name, id);
            if (exist) {
                const code = '1163';
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code }, code);
                return;
            }
            const updategetByManufacturer = await this.ManufacturerService.update(id, updatedManufacturerDto);
            if (updategetByManufacturer) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1160',
                    data: {
                        _id: (updategetByManufacturer as any).id,
                        updatedAt: (updategetByManufacturer as any).updatedAt,
                    }
                }, '1160');
            } else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1162' }, '1162');
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
            const deleteManufacturer = await this.ManufacturerService.delete(id);
            if (deleteManufacturer) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1161', data: { _id: (deleteManufacturer as any).id } }, '1161');
            }
            else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1162' }, '1162');
            }
        } catch {
            throw new BadRequestException();
        }
    }
}