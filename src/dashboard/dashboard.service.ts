import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../user/user.schema';
import { Product } from '../product/product.schema';
import * as _ from 'lodash';
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class DashboardService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Product.name) private productModel: Model<Product>
    ) { }

    async getUserStatistics(queryParams: any) {
        const totalMillers = await this.userModel.countDocuments({ role: new ObjectId('66f52c0ecb77c7439c26ad1e'), status: 'ACTIVE' });
        const totalServiceProvider = await this.userModel.countDocuments({ role: new ObjectId('66f5304c1972e1218478daf6'), status: 'ACTIVE' });
        const totalSupplierManufacturer = await this.userModel.countDocuments({ manufacturerId: new ObjectId('67487f488bb213fbb2f36fc4'), status: 'ACTIVE' });
        const totalSupplierDealer = await this.userModel.countDocuments({ manufacturerId: new ObjectId('67487f6b8bb213fbb2f36fc9'), status: 'ACTIVE' });

        let productCategory: any = { series: [{ data: [] }], xaxis: { categories: [] } };
        let serviceCategory: any = { series: [{ data: [] }], xaxis: { categories: [] } };

        const productCategoryService = await this.productModel.aggregate([
            {
                $match: {
                    $and: [
                        { role: new ObjectId('66f5302b1972e1218478daf3') },
                        { status: 'ACTIVE' }
                    ]
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryDetails'
                }
            },
            {
                $unwind: '$categoryDetails'
            },
            {
                $group: {
                    _id: '$categoryDetails.categoryName',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 4
            },
            {
                $project: {
                    _id: 0,
                    name: '$_id',
                    count: 1
                }
            }
        ]);

        const serviceCategories = await this.productModel.aggregate([
            {
                $match: {
                    $and: [
                        { role: new ObjectId('66f5304c1972e1218478daf6') },
                        { status: 'ACTIVE' }
                    ]
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryDetails'
                }
            },
            {
                $unwind: '$categoryDetails'
            },
            {
                $group: {
                    _id: '$categoryDetails.categoryName',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 4
            },
            {
                $project: {
                    _id: 0,
                    name: '$_id',
                    count: 1
                }
            }
        ]);

        productCategory = {
            series: [{ data: productCategoryService.map((item) => item.count) }],
            xaxis: { categories: productCategoryService.map((item) => item.name) }
        };

        serviceCategory = {
            series: [{ data: serviceCategories.map((item) => item.count) }],
            xaxis: { categories: serviceCategories.map((item) => item.name) }
        };

        return {
            totalMillers,
            totalServiceProvider,
            totalSupplierManufacturer,
            totalSupplierDealer,
            productCategory,
            serviceCategory
        };
    }
}