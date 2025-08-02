import { Body, Controller, Get, Post, Query, Res, BadRequestException, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { SubCategoryService } from './subCategory.service';
import { CreateSubCategoryDto } from './dto/createSubcategory.dto';
import { UpdatedSubCategoryDto } from './dto/updateSubcategory.dto';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { JwtAuthGuard, AdminGuard } from 'src/auth/jwt-auth.guard';
const { ERROR, SUCCESS } = appConst;
import * as _ from 'lodash';

@ApiTags('SubCategory')
@Controller('subcategory')
export class SubCategoryController {
    constructor(
        private readonly SubCategoryService: SubCategoryService,
        private readonly responseService: ResponseService,
    ) { }

    @UseGuards(AdminGuard)
    @ApiBearerAuth()
    @Post()
    async create(@Body() createStateDto: CreateSubCategoryDto, @Res() res: Response) {
        try {
            const exist = await this.SubCategoryService.findByName(createStateDto.subCategoryName);
            if (exist) {
                const code = '1092';
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code }, code);
                return;
            }
            const createdState = await this.SubCategoryService.create(createStateDto);
            if (createdState) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1088',
                    data: {
                        _id: (createdState as any).id,
                        createdAt: (createdState as any).createdAt,
                    }
                }, '1088');
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
    @ApiQuery({ name: 'subCategoryName', required: false, description: 'Return Based on subCategoryName' })
    @ApiQuery({ name: 'categoryId', required: false, description: 'Return Based on categoryId' })
    @Get()
    async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
        try {
            const getState = await this.SubCategoryService.findAll(queryParams);
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
            const getByStudent = await this.SubCategoryService.findById(id)
            if (getByStudent) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1004',
                    data: getByStudent
                }, '1004');
            } else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1091' }, '1091');
            }
        } catch {
            throw new BadRequestException();
        }
    }

    @UseGuards(AdminGuard)
    @ApiBearerAuth()
    @Put(':id')
    async update(@Param('id') id: string, @Body() updatedStateDto: UpdatedSubCategoryDto, @Res() res: any) {
        try {
            const exist = await this.SubCategoryService.findByNameButId(updatedStateDto.subCategoryName, id);
            if (exist) {
                const code = '1092';
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code }, code);
                return;
            }
            const updateStudent = await this.SubCategoryService.update(id, updatedStateDto);
            if (updateStudent) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1089',
                    data: {
                        _id: (updateStudent as any).id,
                        updatedAt: (updateStudent as any).updatedAt,
                    }
                }, '1089');
            } else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1091' }, '1091');
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
            const deleteState = await this.SubCategoryService.delete(id);
            if (deleteState) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1090', data: { _id: (deleteState as any).id } }, '1090');
            }
            else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1091' }, '1091');
            }
        } catch {
            throw new BadRequestException();
        }
    }
}