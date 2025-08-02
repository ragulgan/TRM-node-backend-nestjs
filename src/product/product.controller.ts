import { Body, Controller, Get, Post, Query, Res, BadRequestException, Param, Put, Delete, UseGuards, Request } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/createProduct.dto';
import { UpdatedProductDto } from './dto/updateProduct.dto';
import { CreateProductBySupplierDto } from './dto/createProductSupplier.dto';
import { UpdatedProductBySupplierDto } from './dto/updateProductSupplier.dto';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { AdminGuard, MillerGuard, MillerAdminGuard, ServiceProviderSupplierGuard, ServiceProviderSupplierMillerAdminGuard, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProductEnquiryDto } from './dto/productEnquiry.dto';
const { ERROR, SUCCESS } = appConst;
import * as _ from 'lodash';
import { verifyAndExtractToken } from '../utill/utill';

@ApiTags('Product')
@Controller('product')
export class ProductController {
    constructor(
        private readonly ProductService: ProductService,
        private readonly responseService: ResponseService,
    ) { }

    @UseGuards(AdminGuard)
    @ApiBearerAuth()
    @Post()
    async create(@Body() createProductDto: CreateProductDto, @Res() res: Response) {
        try {
            const createdProduct = await this.ProductService.create(
                createProductDto
            )
            if (createdProduct) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1027',
                    data: {
                        _id: (createdProduct as any).id,
                        createdAt: (createdProduct as any).createdAt,
                    }
                }, '1027');
            }
            else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
            }
        }
        catch (e) {
            throw new BadRequestException();
        }
    }

    @UseGuards(ServiceProviderSupplierGuard)
    @ApiBearerAuth()
    @Post('supplier')
    async createBySupplier(@Body() createProductDto: CreateProductBySupplierDto, @Request() req: any, @Res() res: Response) {
        try {
            const decodedToken = verifyAndExtractToken(req.headers);
            const createdProduct = await this.ProductService.createdBySupplier(createProductDto, decodedToken.id);
            if (createdProduct) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1027',
                    data: {
                        _id: (createdProduct as any).id,
                        createdAt: (createdProduct as any).createdAt,
                    }
                }, '1027');
            }
            else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
            }
        } catch (e) {
            console.log('e===>', e)
            throw new BadRequestException();
        }
    }

    @UseGuards(MillerGuard)
    @ApiBearerAuth()
    @Post('enquiry')
    async sendProductRequest(@Body() productEnquiryDto: ProductEnquiryDto, @Res() res: Response) {
        try {
            await this.ProductService.sendProductRequest(productEnquiryDto);
            this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                code: '1103',
            }, '1103');
        } catch (e) {
            this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '400' }, '400');
        }
    }

    @UseGuards(ServiceProviderSupplierGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'page', required: false, })
    @ApiQuery({ name: 'limit', required: false, })
    @ApiQuery({ name: 'status', required: false, description: 'Return Based on status' })
    @ApiQuery({ name: 'subCategory', required: false, description: 'Return Based on subCategory', type: [String] })
    @ApiQuery({ name: 'category', required: false, description: 'Return Based on category', type: [String] })
    @ApiQuery({ name: 'productName', required: false, description: 'Return Based on productName' })
    @Get('supplier')
    async findAllProductBySupplier(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any, @Request() req) {
        try {
            const decodedToken = verifyAndExtractToken(req.headers);
            const result = await this.ProductService.findProductBySupplier(queryParams, decodedToken.id);
            if (!_.isEmpty(result && result.ProductList)) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1004',
                    data: result.ProductList,
                    count: result.count
                }, '1004');
            }
            else {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: result.count }, '1005')
            }
        } catch (e) {
            console.log('e===>', e)
            throw new BadRequestException();
        }
    }

    @UseGuards(MillerAdminGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'page', required: false, })
    @ApiQuery({ name: 'limit', required: false, })
    @ApiQuery({ name: 'status', required: false, description: 'Return Based on status' })
    @ApiQuery({ name: 'subCategory', required: false, description: 'Return Based on subCategory', type: [String] })
    @ApiQuery({ name: 'category', required: false, description: 'Return Based on category', type: [String] })
    @ApiQuery({ name: 'role', required: false, description: 'Return Based on Roles' })
    @ApiQuery({ name: 'userId', required: false, description: 'Return Based on UserId' })
    @ApiQuery({ name: 'productPrice', required: false, description: 'Return Based on productPrice' })
    @ApiQuery({ name: 'productName', required: false, description: 'Return Based on productName' })

    @Get()
    async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any, @Request() req) {
        try {
            const result = await this.ProductService.findAll(queryParams);
            if (!_.isEmpty(result && result.ProductList)) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1004',
                    data: result.ProductList,
                    count: result.count
                }, '1004');
            }
            else {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: result.count }, '1005')
            }
        } catch (e) {
            console.log('e===>', e)
            throw new BadRequestException();
        }
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'page', required: false, })
    @ApiQuery({ name: 'limit', required: false, })
    @ApiQuery({ name: 'category', required: true, description: 'Return Based on category' })

    @Get('relatedProduct')
    async findRelatedProduct(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any, @Request() req) {
        try {
            const result = await this.ProductService.findRelatedProduct(queryParams);
            if (!_.isEmpty(result && result.RelatedProductList)) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1004',
                    data: result.RelatedProductList,
                    count: result.count
                }, '1004');
            }
            else {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: result.count }, '1005')
            }
        } catch (e) {
            console.log('e===>', e)
            throw new BadRequestException();
        }
    }

    @UseGuards(ServiceProviderSupplierGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'page', required: false, })
    @ApiQuery({ name: 'limit', required: false, })
    @ApiQuery({ name: 'category', required: true, description: 'Return Based on category' })

    @Get('supplier/relatedProduct')
    async findSupplierRelatedProduct(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any, @Request() req) {
        try {
            const decodedToken = verifyAndExtractToken(req.headers);
            const result = await this.ProductService.findSupplierRelatedProduct(queryParams, decodedToken.id);
            if (!_.isEmpty(result && result.SupplierRelatedProductList)) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1004',
                    data: result.SupplierRelatedProductList,
                    count: result.count
                }, '1004');
            }
            else {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1005', data: [], count: result.count }, '1005')
            }
        } catch (e) {
            console.log('e===>', e)
            throw new BadRequestException();
        }
    }

    @UseGuards(AdminGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'page', required: false, })
    @ApiQuery({ name: 'limit', required: false, })
    @ApiQuery({ name: 'ownerName', required: false, description: 'Return Based on ownerName' })
    @ApiQuery({ name: 'fromEmail', required: false, description: 'Return Based on fromEmail' })
    @ApiQuery({ name: 'toEmail', required: false, description: 'Return Based on toEmail' })
    @ApiQuery({ name: 'mobileNumber', required: false, description: 'Return Based on mobileNumber' })
    @ApiQuery({ name: 'productOwnername', required: false, description: 'Return Based on productOwnername' })
    @ApiQuery({ name: 'productName', required: false, description: 'Return Based on productName' })
    @ApiQuery({ name: 'companyName', required: false, description: 'Return Based on companyName' })
    @ApiQuery({ name: 'district', required: false, description: 'Return Based on district' })
    @ApiQuery({ name: 'city', required: false, description: 'Return Based on city' })
    @ApiQuery({ name: 'status', required: false, description: 'Return Based on status' })
    @ApiQuery({ name: 'createdAt', required: false, description: 'Return Based on createdAt' })
    @ApiQuery({ name: 'role', required: false, description: 'Return Based on role' })
    @Get('productEnquiry')
    async findAllProductEnquiry(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
        try {
            const getState = await this.ProductService.findAllProductEnquiry(queryParams);
            if (!_.isEmpty(getState.productEnquiryList)) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1004',
                    data: getState.productEnquiryList,
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

    @UseGuards(ServiceProviderSupplierMillerAdminGuard)
    @ApiBearerAuth()
    @Get(':id')
    async findById(@Param('id') id: string, @Res() res: any) {
        try {
            const getByStudent = await this.ProductService.findById(id)
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
    @Get('productEnquiry/:id')
    async findByIdProductEnquiry(@Param('id') id: string, @Res() res: any) {
        try {
            const getByStudent = await this.ProductService.findByIdProductEnquiry(id)
            if (getByStudent) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1004',
                    data: getByStudent
                }, '1004');
            } else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1115' }, '1115');
            }
        } catch {
            throw new BadRequestException();
        }
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Get('supplierserviceprovider/:id')
    async findByUserId(@Param('id') id: string, @Res() res: any) {
        try {
            const getByStudent = await this.ProductService.findByUserId(id)
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
    async update(@Param('id') id: string, @Body() updatedProductDto: UpdatedProductDto, @Res() res: any) {
        try {
            const updateStudent = await this.ProductService.update(id, updatedProductDto);
            if (updateStudent) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1028',
                    data: {
                        _id: (updateStudent as any).id,
                        updatedAt: (updateStudent as any).updatedAt,
                    }
                }, '1028');
            } else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1005' }, '1005');
            }
        } catch {
            throw new BadRequestException();
        }
    }

    @UseGuards(ServiceProviderSupplierGuard)
    @ApiBearerAuth()
    @Put('supplier/:id')
    async updateBySupplier(@Param('id') id: string, @Body() updatedProductDto: UpdatedProductBySupplierDto, @Request() req: any, @Res() res: any) {
        try {
            const decodedToken = verifyAndExtractToken(req.headers);
            const updateStudent = await this.ProductService.updatedBySupplier(id, updatedProductDto, decodedToken.id);
            if (updateStudent) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1028',
                    data: {
                        _id: (updateStudent as any).id,
                        updatedAt: (updateStudent as any).updatedAt,
                    }
                }, '1028');
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
            const deleteProduct = await this.ProductService.delete(id);
            if (deleteProduct) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1029', data: { _id: (deleteProduct as any).id } }, '1029');
            }
            else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1005' }, '1005');
            }
        } catch {
            throw new BadRequestException();
        }
    }

    @UseGuards(AdminGuard)
    @ApiBearerAuth()
    @Delete('productEnquiry/:id')
    async deleteProductEnquiry(@Param('id') id: string, @Res() res: any) {
        try {
            const deleteState = await this.ProductService.deleteProductEnquiry(id);
            if (deleteState) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1116', data: { _id: (deleteState as any).id } }, '1116');
            }
            else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1115' }, '1115');
            }
        } catch {
            throw new BadRequestException();
        }
    }
}