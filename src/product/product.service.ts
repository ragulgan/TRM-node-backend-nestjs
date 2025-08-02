import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './product.schema';
import { CreateProductDto } from './dto/createProduct.dto';
import { UpdatedProductDto } from './dto/updateProduct.dto';
import { ProductEnquiryDto } from './dto/productEnquiry.dto';
import { CreateProductBySupplierDto } from './dto/createProductSupplier.dto';
import { UpdatedProductBySupplierDto } from './dto/updateProductSupplier.dto';
import * as _ from 'lodash';
import { EmailService } from '../emailService/emailService.service'
import { User } from 'src/user/user.schema';
import { ProductEnquiry } from './productEnquiry.schema';
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class ProductService {
    constructor(
        @InjectModel(Product.name) private ProductModel: Model<Product>,
        @InjectModel(User.name) private UserModel: Model<User>,
        @InjectModel(ProductEnquiry.name) private ProductEnquiryModel: Model<ProductEnquiry>,
        private readonly emailService: EmailService,
    ) { }

    /**
     * Create new product by admin login also in user collection add (categoryId, subcategoryId, productName) for filter
     * @param createProductDto
     * @returns object
     */
    async create(createProductDto: CreateProductDto): Promise<Product> {
        try {
            const createdProduct = new this.ProductModel(createProductDto);
            const saveProduct = await createdProduct.save();
            await this.UserModel.findOneAndUpdate(
                { _id: createProductDto.userId },
                {
                    $addToSet: {
                        categoryId: new ObjectId(createProductDto.category),
                        subcategoryId: new ObjectId(createProductDto.subCategory),
                        productName: createProductDto.productName
                    }
                },
                { new: true }
            );
            return saveProduct;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    /**
     * Create product by supplier/service provider login also in user collection add (categoryId, subcategoryId, productName) for filter
     * @param createProductDto
     * @param userId
     * @returns object
     */
    async createdBySupplier(createProductDto: CreateProductBySupplierDto, userId: string): Promise<Product> {
        try {
            const createProductData = {
                ...createProductDto,
                userId,
            }
            const createdProduct = new this.ProductModel(createProductData);
            const saveProduct = await createdProduct.save();
            await this.UserModel.findOneAndUpdate(
                { _id: userId },
                {
                    $addToSet: {
                        categoryId: new ObjectId(createProductDto.category),
                        subcategoryId: new ObjectId(createProductDto.subCategory),
                        productName: createProductDto.productName
                    }
                },
                { new: true }
            );
            return saveProduct;
        } catch (error) {
            console.log(error)
            throw new Error("Validation Error occurred while saving Product.");
        }
    }

    /**
     * Send product request miller to product owner (supplier/service provider) and also create product request log
     * @param sendProductEnquiryDto
     * @returns object
     */
    async sendProductRequest(sendProductEnquiryDto: ProductEnquiryDto): Promise<ProductEnquiry> {
        try {
            const templateData = {
                "name": sendProductEnquiryDto.ownerName,
                "message": sendProductEnquiryDto.message,
                "companyName": sendProductEnquiryDto.companyName,
                "email": sendProductEnquiryDto.fromEmail,
                "mobileNumber": sendProductEnquiryDto.mobileNumber,
                "district": sendProductEnquiryDto.district,
                "city": sendProductEnquiryDto.city,
                "productOwnername": sendProductEnquiryDto.productOwnername,
                "productName": sendProductEnquiryDto.productName
            }
            await this.emailService.sendMail(
                sendProductEnquiryDto.toEmail,
                "Enquiry about the product details.",
                `${sendProductEnquiryDto.role}`,
                templateData
            ).then(() => { })
        } catch (error) {
            console.log("Error sending product enquiry mail:", error);
            throw new Error("Error mail not sent.");
        }
        return this.ProductEnquiryModel.create(sendProductEnquiryDto);
    }

    /**
     * Find product by supplier login id under that supplier/service provider product only shown
     * @param queryParams
     * @param userId
     * @returns array of objects
     */
    async findProductBySupplier(queryParams: any, userId: string) {
        const ObjectId = mongoose.Types.ObjectId;
        const limit = Number(queryParams.limit) || 10;
        const page = Number(queryParams.page) || 1;
        const skipValue = (page - 1) * limit;

        let match: any = {
            $and: [
                { userId: new ObjectId(userId) },
                { status: 'ACTIVE' }
            ]
        };

        if (queryParams.productName) {
            match.productName = new RegExp(queryParams.productName, 'i');
        }

        if (queryParams.category) {
            if (_.isArray(queryParams.category)) {
                match['category'] = { $in: queryParams.category.map((id: string) => new ObjectId(id)) };
            } else {
                match['category'] = new ObjectId(queryParams.category);
            }
        }

        if (queryParams.subCategory) {
            if (_.isArray(queryParams.subCategory)) {
                match['subCategory'] = { $in: queryParams.subCategory.map((id: string) => new ObjectId(id)) };
            } else {
                match['subCategory'] = new ObjectId(queryParams.subCategory);
            }
        }

        if (queryParams.status) {
            match.status = queryParams.status;
        }

        const ProductList = await this.ProductModel.aggregate([
            { $match: match },
            { $sort: { createdAt: -1 } },
            { $skip: skipValue },
            { $limit: limit },
            {
                $lookup: {
                    from: 'users',
                    let: { userId: '$userId' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
                        {
                            $lookup: {
                                from: 'states',
                                localField: 'state',
                                foreignField: '_id',
                                as: 'stateDetails',
                            },
                        },
                        { $unwind: { path: '$stateDetails', preserveNullAndEmptyArrays: true } },
                        {
                            $lookup: {
                                from: 'districts',
                                localField: 'district',
                                foreignField: '_id',
                                as: 'districtDetails',
                            },
                        },
                        { $unwind: { path: '$districtDetails', preserveNullAndEmptyArrays: true } },
                        {
                            $lookup: {
                                from: 'cities',
                                localField: 'city',
                                foreignField: '_id',
                                as: 'cityDetails',
                            },
                        },
                        { $unwind: { path: '$cityDetails', preserveNullAndEmptyArrays: true } },
                        {
                            $project: {
                                _id: 1,
                                email: 1,
                                companyImage: 1,
                                companyName: 1,
                                currentAddress: 1,
                                ownerName: 1,
                                contactPersonName: 1,
                                'stateDetails.stateName': 1,
                                'districtDetails.districtName': 1,
                                'cityDetails.cityName': 1,
                                mobileNumber: 1,
                                description: 1,
                                website: 1,
                                whatappno: 1,
                            },
                        },
                    ],
                    as: 'userDetails',
                },
            },
            { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'roles',
                    localField: 'role',
                    foreignField: '_id',
                    as: 'roleDetails',
                },
            },
            { $unwind: { path: '$roleDetails', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryDetails',
                },
            },
            { $unwind: { path: '$categoryDetails', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'subcategories',
                    localField: 'subCategory',
                    foreignField: '_id',
                    as: 'subCategoryDetails',
                },
            },
            { $unwind: { path: '$subCategoryDetails', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    productName: 1,
                    productPrice: 1,
                    productImage: 1,
                    description: 1,
                    status: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    userId: {
                        id: '$userDetails._id',
                        email: '$userDetails.email',
                        companyImage: '$userDetails.companyImage',
                        companyName: '$userDetails.companyName',
                        currentAddress: '$userDetails.currentAddress',
                        city: '$userDetails.cityDetails.cityName',
                        district: '$userDetails.districtDetails.districtName',
                        state: '$userDetails.stateDetails.stateName',
                        ownerName: '$userDetails.ownerName',
                        contactPersonName: '$userDetails.contactPersonName',
                        mobileNumber: '$userDetails.mobileNumber',
                        description: '$userDetails.description',
                        website: '$userDetails.website',
                        whatappno: '$userDetails.whatappno',
                    },
                    role: {
                        id: '$roleDetails._id',
                        role: '$roleDetails.role',
                        displayName: '$roleDetails.displayName',
                    },
                    category: {
                        id: '$categoryDetails._id',
                        categoryName: '$categoryDetails.categoryName',
                    },
                    subCategory: {
                        id: '$subCategoryDetails._id',
                        categoryName: '$subCategoryDetails.subCategoryName',
                    }
                },
            },
        ]).exec();
        const count = await this.ProductModel.countDocuments(match).exec();
        return { ProductList, count };
    }

    /**
     * Find all product admin and miller login
     * @param queryParams
     * @returns array of objects
     */
    async findAll(queryParams: any) {
        const ObjectId = mongoose.Types.ObjectId;
        const limit = Number(queryParams.limit) || 10;
        const page = Number(queryParams.page) || 1;
        const skipValue = (page - 1) * limit;
        let match: any = { status: 'ACTIVE' };

        if (queryParams.productName) {
            match.productName = new RegExp(queryParams.productName, 'i');
        }

        if (queryParams.productPrice) {
            match.productPrice = queryParams.productPrice;
        }

        if (queryParams.role) {
            match.role = new ObjectId(queryParams.role);
        }

        if (queryParams.userId) {
            match.userId = new ObjectId(queryParams.userId);
        }

        if (queryParams.category) {
            if (_.isArray(queryParams.category)) {
                match['category'] = { $in: queryParams.category.map((id: string) => new ObjectId(id)) };
            } else {
                match['category'] = new ObjectId(queryParams.category);
            }
        }

        if (queryParams.subCategory) {
            if (_.isArray(queryParams.subCategory)) {
                match['subCategory'] = { $in: queryParams.subCategory.map((id: string) => new ObjectId(id)) };
            } else {
                match['subCategory'] = new ObjectId(queryParams.subCategory);
            }
        }

        if (queryParams.status) {
            match.status = queryParams.status;
        }

        const ProductList = await this.ProductModel.aggregate([
            { $match: match },
            { $sort: { createdAt: -1 } },
            { $skip: skipValue },
            { $limit: limit },
            {
                $lookup: {
                    from: 'users',
                    let: { userId: '$userId' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
                        {
                            $lookup: {
                                from: 'states',
                                localField: 'state',
                                foreignField: '_id',
                                as: 'stateDetails',
                            },
                        },
                        { $unwind: { path: '$stateDetails', preserveNullAndEmptyArrays: true } },
                        {
                            $lookup: {
                                from: 'districts',
                                localField: 'district',
                                foreignField: '_id',
                                as: 'districtDetails',
                            },
                        },
                        { $unwind: { path: '$districtDetails', preserveNullAndEmptyArrays: true } },
                        {
                            $lookup: {
                                from: 'cities',
                                localField: 'city',
                                foreignField: '_id',
                                as: 'cityDetails',
                            },
                        },
                        { $unwind: { path: '$cityDetails', preserveNullAndEmptyArrays: true } },
                        {
                            $project: {
                                _id: 1,
                                email: 1,
                                companyImage: 1,
                                companyName: 1,
                                currentAddress: 1,
                                ownerName: 1,
                                contactPersonName: 1,
                                'stateDetails.stateName': 1,
                                'districtDetails.districtName': 1,
                                'cityDetails.cityName': 1,
                                mobileNumber: 1,
                                description: 1,
                                website: 1,
                                whatappno: 1,
                            },
                        },
                    ],
                    as: 'userDetails',
                },
            },
            { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'roles',
                    localField: 'role',
                    foreignField: '_id',
                    as: 'roleDetails',
                },
            },
            { $unwind: { path: '$roleDetails', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryDetails',
                },
            },
            { $unwind: { path: '$categoryDetails', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'subcategories',
                    localField: 'subCategory',
                    foreignField: '_id',
                    as: 'subCategoryDetails',
                },
            },
            { $unwind: { path: '$subCategoryDetails', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    productName: 1,
                    productPrice: 1,
                    productImage: 1,
                    description: 1,
                    status: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    userId: {
                        id: '$userDetails._id',
                        email: '$userDetails.email',
                        companyImage: '$userDetails.companyImage',
                        companyName: '$userDetails.companyName',
                        currentAddress: '$userDetails.currentAddress',
                        city: '$userDetails.cityDetails.cityName',
                        district: '$userDetails.districtDetails.districtName',
                        state: '$userDetails.stateDetails.stateName',
                        ownerName: '$userDetails.ownerName',
                        contactPersonName: '$userDetails.contactPersonName',
                        mobileNumber: '$userDetails.mobileNumber',
                        description: '$userDetails.description',
                        website: '$userDetails.website',
                        whatappno: '$userDetails.whatappno',
                    },
                    role: {
                        id: '$roleDetails._id',
                        role: '$roleDetails.role',
                        displayName: '$roleDetails.displayName',
                    },
                    category: {
                        id: '$categoryDetails._id',
                        categoryName: '$categoryDetails.categoryName',
                    },
                    subCategory: {
                        id: '$subCategoryDetails._id',
                        categoryName: '$subCategoryDetails.subCategoryName',
                    }
                },
            },
        ]).exec();
        const count = await this.ProductModel.countDocuments(match).exec();
        return { ProductList, count };
    }

    /**
     * Category Id based return related product details in product view page
     * @param queryParams
     * @returns array of objects
     */
    async findRelatedProduct(queryParams: any) {
        const limit = Number(queryParams.limit) || 10;
        const page = Number(queryParams.page) || 1;
        const skipValue = (page - 1) * limit;
        const ObjectId = mongoose.Types.ObjectId;
        let match: any = { status: 'ACTIVE' };
        if (queryParams.category) {
            match.category = new ObjectId(queryParams.category);
        }
        const RelatedProductList = await this.ProductModel.find(match)
            .select('productName productImage productPrice')
            .populate('category', 'id categoryName')
            .sort({ createdAt: -1 })
            .skip(skipValue)
            .limit(limit)
            .exec();
        const count = await this.ProductModel.countDocuments(match).exec()
        return { RelatedProductList, count };
    }

    /**
     * Find Related product details based on supplier login (under that supplier/service provider related product)
     * @param queryParams
     * @param userId
     * @returns array of objects
     */
    async findSupplierRelatedProduct(queryParams: any, userId: string) {
        const limit = Number(queryParams.limit) || 10;
        const page = Number(queryParams.page) || 1;
        const skipValue = (page - 1) * limit;
        const ObjectId = mongoose.Types.ObjectId;
        let match: any = {
            $and: [
                { userId: new ObjectId(userId) },
                { status: 'ACTIVE' }
            ]
        };
        if (queryParams.category) {
            match.category = new ObjectId(queryParams.category);
        }
        const SupplierRelatedProductList = await this.ProductModel.find(match)
            .select('productName productImage productPrice')
            .populate('category', 'id categoryName')
            .sort({ createdAt: -1 })
            .skip(skipValue)
            .limit(limit)
            .exec();
        const count = await this.ProductModel.countDocuments(match).exec()
        return { SupplierRelatedProductList, count };
    }

    /**
     * Get all product enquiry details admin login (miller product enquiry)
     * @param queryParams
     * @returns array of objects
     */
    async findAllProductEnquiry(queryParams: any) {
        const limit = Number(queryParams.limit)
        const page = Number(queryParams.page)
        const skipValue = Number(page - 1) * limit
        let match: any = { status: 'UNRESOLVE' }

        if (queryParams.ownerName || queryParams.fromEmail || queryParams.toEmail || queryParams.mobileNumber || queryParams.productOwnername || queryParams.productName) {
            const orCondition = []
            if (queryParams.ownerName) {
                orCondition.push({
                    ownerName: new RegExp(`${queryParams.ownerName}`, 'i')
                });
            }

            if (queryParams.fromEmail) {
                orCondition.push({
                    fromEmail: new RegExp(`${queryParams.fromEmail}`, 'i')
                });
            }

            if (queryParams.toEmail) {
                orCondition.push({
                    toEmail: new RegExp(`${queryParams.toEmail}`, 'i')
                });
            }

            if (queryParams.mobileNumber) {
                orCondition.push({
                    mobileNumber: new RegExp(`${queryParams.mobileNumber}`, 'i')
                });
            }

            if (queryParams.productOwnername) {
                orCondition.push({
                    productOwnername: new RegExp(`${queryParams.productOwnername}`, 'i')
                });
            }

            if (queryParams.productName) {
                orCondition.push({
                    productName: new RegExp(`${queryParams.productName}`, 'i')
                });
            }

            match = { ...match, $or: orCondition }
        }

        if (queryParams.companyName) {
            match.companyName = { $regex: new RegExp(queryParams.companyName, 'i') };
        }

        if (queryParams.district) {
            match.district = { $regex: new RegExp(queryParams.district, 'i') };
        }

        if (queryParams.city) {
            match.city = { $regex: new RegExp(queryParams.city, 'i') };
        }

        if (queryParams.status) {
            match.status = queryParams.status;
        }

        if (queryParams.createdAt) {
            match.createdAt = queryParams.createdAt;
        }

        if (queryParams.role) {
            match.role = { $regex: new RegExp(queryParams.role, 'i') };
        }

        const productEnquiryList = await this.ProductEnquiryModel.find(match)
            .sort({ createdAt: -1 })
            .skip(skipValue)
            .limit(limit)
            .exec();
        const count = await this.ProductEnquiryModel.countDocuments(match).exec()
        return { productEnquiryList, count };
    }

    /**
     * Get particular product enquiry details by id
     * @param id
     * @returns object
     */
    async findByIdProductEnquiry(id: string): Promise<ProductEnquiry> {
        return this.ProductEnquiryModel.findById(id).exec();
    }

    /**
     * Get user details by id
     * @param id
     * @returns object
     */
    async findByUserId(id: string): Promise<User> {
        return await this.UserModel.findById(id)
            .select('ownerName contactPersonName mobileNumber email currentAddress profileImage companyName companyImage description website whatappno memberJoiningDate registerNumber')
            .populate('state', 'id stateName')
            .populate('district', 'id districtName')
            .populate('city', 'id cityName').exec();
    }

    /**
     * Find product details by id
     * @param id
     * @returns object
     */
    async findById(id: string) {
        const ObjectId = mongoose.Types.ObjectId;
        const ProductDetails = await this.ProductModel.aggregate([
            {
                $match: {
                    _id: new ObjectId(id),
                },
            },
            {
                $lookup: {
                    from: 'users',
                    let: { userId: '$userId' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
                        {
                            $lookup: {
                                from: 'states',
                                localField: 'state',
                                foreignField: '_id',
                                as: 'stateDetails',
                            },
                        },
                        { $unwind: { path: '$stateDetails', preserveNullAndEmptyArrays: true } },
                        {
                            $lookup: {
                                from: 'districts',
                                localField: 'district',
                                foreignField: '_id',
                                as: 'districtDetails',
                            },
                        },
                        { $unwind: { path: '$districtDetails', preserveNullAndEmptyArrays: true } },
                        {
                            $lookup: {
                                from: 'cities',
                                localField: 'city',
                                foreignField: '_id',
                                as: 'cityDetails',
                            },
                        },
                        { $unwind: { path: '$cityDetails', preserveNullAndEmptyArrays: true } },
                        {
                            $project: {
                                _id: 1,
                                email: 1,
                                companyImage: 1,
                                companyName: 1,
                                currentAddress: 1,
                                ownerName: 1,
                                contactPersonName: 1,
                                'stateDetails.stateName': 1,
                                'districtDetails.districtName': 1,
                                'cityDetails.cityName': 1,
                                mobileNumber: 1,
                                description: 1,
                                website: 1,
                                whatappno: 1,
                            },
                        },
                    ],
                    as: 'userDetails',
                },
            },
            { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'roles',
                    localField: 'role',
                    foreignField: '_id',
                    as: 'roleDetails',
                },
            },
            { $unwind: { path: '$roleDetails', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryDetails',
                },
            },
            { $unwind: { path: '$categoryDetails', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'subcategories',
                    localField: 'subCategory',
                    foreignField: '_id',
                    as: 'subCategoryDetails',
                },
            },
            { $unwind: { path: '$subCategoryDetails', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    productName: 1,
                    productPrice: 1,
                    productImage: 1,
                    description: 1,
                    status: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    userId: {
                        id: '$userDetails._id',
                        email: '$userDetails.email',
                        companyImage: '$userDetails.companyImage',
                        companyName: '$userDetails.companyName',
                        currentAddress: '$userDetails.currentAddress',
                        city: '$userDetails.cityDetails.cityName',
                        district: '$userDetails.districtDetails.districtName',
                        state: '$userDetails.stateDetails.stateName',
                        ownerName: '$userDetails.ownerName',
                        contactPersonName: '$userDetails.contactPersonName',
                        mobileNumber: '$userDetails.mobileNumber',
                        description: '$userDetails.description',
                        website: '$userDetails.website',
                        whatappno: '$userDetails.whatappno',
                    },
                    role: {
                        id: '$roleDetails._id',
                        role: '$roleDetails.role',
                        displayName: '$roleDetails.displayName',
                    },
                    category: {
                        id: '$categoryDetails._id',
                        categoryName: '$categoryDetails.categoryName',
                    },
                    subCategory: {
                        id: '$subCategoryDetails._id',
                        categoryName: '$subCategoryDetails.subCategoryName',
                    }
                },
            },
        ]).exec();

        return ProductDetails.length ? ProductDetails[0] : null;
    }

    /**
     * Update product details by id (admin login)
     * @param id
     * @param updatedProductDto
     * @returns object
     */
    async update(id: string, updatedProductDto: UpdatedProductDto): Promise<Product> {
        try {
            const updateProduct = await this.ProductModel.findOneAndUpdate({ _id: id }, updatedProductDto).exec();
            await this.UserModel.findOneAndUpdate(
                { _id: updatedProductDto.userId },
                {
                    $addToSet: {
                        categoryId: new ObjectId(updatedProductDto.category),
                        subcategoryId: new ObjectId(updatedProductDto.subCategory),
                        productName: updatedProductDto.productName
                    }
                },
                { new: true }
            );
            return updateProduct
        } catch (error) {
            throw new Error("Error occurred while updating Product.");
        }
    }

    /**
     * Update product details by id (supplier/service provider login)
     * @param id
     * @param updatedProductDto
     * @param userId
     * @returns object
     */
    async updatedBySupplier(id: string, updatedProductDto: UpdatedProductBySupplierDto, userId: string): Promise<Product> {
        try {
            const updateData = {
                ...updatedProductDto,
                userId,
            };
            const updateProductBySupplier = await this.ProductModel.findOneAndUpdate({ _id: id }, updateData).exec();
            await this.UserModel.findOneAndUpdate(
                { _id: userId },
                {
                    $addToSet: {
                        categoryId: new ObjectId(updatedProductDto.category),
                        subcategoryId: new ObjectId(updatedProductDto.subCategory),
                        productName: updatedProductDto.productName
                    }
                },
                { new: true }
            );
            return updateProductBySupplier
        } catch (error) {
            throw new Error("Error occurred while updating Product.");
        }
    }

    /**
     * Delete product details by id (admin login)
     * @param id
     * @returns object
     */
    async delete(id: string): Promise<Product> {
        const deleteProduct = await this.ProductModel
            .findOneAndUpdate(
                { _id: id },
                { $set: { status: 'DELETED' } },
                { new: true }
            )
            .exec();
        return deleteProduct
    }

    /**
     * Delete product enquiry details by id (admin login)
     * @param id
     * @returns object
     */
    async deleteProductEnquiry(id: string): Promise<ProductEnquiry> {
        const deletedState = await this.ProductEnquiryModel
            .findByIdAndUpdate(
                id,
                { $set: { status: 'DELETED' } },
                { new: true }
            )
            .lean()
            .exec();
        return deletedState
    }
}