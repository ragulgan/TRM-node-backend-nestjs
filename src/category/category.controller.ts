import { Body, Controller, Get, Post, Query, Res, BadRequestException, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { UpdatedCategoryDto } from './dto/updateCategory.dto';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { JwtAuthGuard, AdminGuard } from 'src/auth/jwt-auth.guard';
const { ERROR, SUCCESS } = appConst;
import * as _ from 'lodash';

@ApiTags('Category')
@Controller('category')
export class CategoryController {
    constructor(
        private readonly CategoryService: CategoryService,
        private readonly responseService: ResponseService,
    ) { }

    @UseGuards(AdminGuard)
    @ApiBearerAuth()
    @Post()
    async create(@Body() createCategoryDto: CreateCategoryDto, @Res() res: Response) {
        try {
            const exist = await this.CategoryService.findByName(createCategoryDto.categoryName);
            if (exist) {
                const code = '1083';
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code }, code);
                return;
            }
            const createdCountry = await this.CategoryService.create(createCategoryDto);
            if (createdCountry) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1079',
                    data: {
                        _id: (createdCountry as any).id,
                        createdAt: (createdCountry as any).createdAt,
                    }
                }, '1079');
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
    @ApiQuery({ name: 'categoryName', required: false, description: 'Return Based on categoryName' })
    @Get()
    async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
        try {
            const getCountry = await this.CategoryService.findAll(queryParams);
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
            const getByStudent = await this.CategoryService.findById(id)
            if (getByStudent) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1004',
                    data: getByStudent
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
    async update(@Param('id') id: string, @Body() updatedCategoryDto: UpdatedCategoryDto, @Res() res: any) {
        try {
            const exist = await this.CategoryService.findByNameButId(updatedCategoryDto.categoryName, id);
            if (exist) {
                const code = '1083';
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code }, code);
                return;
            }
            const updateStudent = await this.CategoryService.update(id, updatedCategoryDto);
            if (updateStudent) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1080',
                    data: {
                        _id: (updateStudent as any).id,
                        updatedAt: (updateStudent as any).updatedAt,
                    }
                }, '1080');
            } else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1082' }, '1082');
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
            const deleteCountry = await this.CategoryService.delete(id);
            if (deleteCountry) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1081', data: { _id: (deleteCountry as any).id } }, '1081');
            }
            else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1082' }, '1082');
            }
        } catch {
            throw new BadRequestException();
        }
    }

}