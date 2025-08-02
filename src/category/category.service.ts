import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from './category.schema';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { UpdatedCategoryDto } from './dto/updateCategory.dto';
import * as _ from 'lodash';

@Injectable()
export class CategoryService {
    constructor(
        @InjectModel(Category.name) private CategoryModel: Model<Category>,
    ) { }

    /**
     * Create Category
     * @param createCategoryDto
     * @returns object
     */
    async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
        try {
            const createdCountry = new this.CategoryModel(createCategoryDto);
            const data = await createdCountry.save();
            return data
        } catch (error) {
            console.error("Validation Error:", error);
            throw new Error(`${error.message}`);
        }
    }

    /**
     * Get category list details
     * @param queryParams
     * @returns array of objects
     */
    async findAll(queryParams: any) {
        const limit = Number(queryParams.limit)
        const page = Number(queryParams.page)
        const skipValue = Number(page - 1) * limit
        let match: any = { status: 'ACTIVE' }

        if (queryParams.categoryName) {
            const orCondition = []
            if (queryParams.categoryName) {
                orCondition.push({
                    categoryName: new RegExp(`${queryParams.categoryName}`, 'i')
                });
            }
            match = { ...match, $or: orCondition }
        }

        if (queryParams.status) {
            match.status = queryParams.status;
        }

        const CountryList = await this.CategoryModel.find(match).sort({ createdAt: -1 }).skip(skipValue).limit(limit).exec();
        const count = await this.CategoryModel.countDocuments(match).exec()
        return { CountryList, count };
    }

    /**
     * Find category details using category id
     * @param id
     * @returns object
     */
    async findById(id: string): Promise<Category> {
        return this.CategoryModel.findById(id).exec();
    }

    /**
     * Find category by it's name
     * @param categoryName
     * @returns object
     */
    async findByName(categoryName: string): Promise<Category | null> {
        return await this.CategoryModel.findOne({ $or: [{ categoryName: categoryName }], status: { $ne: 'DELETED' } }).exec();
    }

    /**
     * Find category by it's name first param also category id second param
     * @param categoryName
     * @param id
     * @returns object
     */
    async findByNameButId(categoryName: string, id: string): Promise<Category | null> {
        return await this.CategoryModel.findOne({ $or: [{ categoryName: categoryName }], _id: { $ne: id }, status: { $ne: 'DELETED' } }).exec();
    }

    /**
     * Update category by it's id first param and payload second param 
     * @param id
     * @param updatedCategoryDto
     * @returns object
     */
    async update(id: string, updatedCategoryDto: UpdatedCategoryDto): Promise<Category> {
        return this.CategoryModel.findOneAndUpdate({ _id: id }, updatedCategoryDto).exec();
    }

    /**
     * Delete category by it's id based
     * @param id
     * @returns object
     */
    async delete(id: string): Promise<Category> {
        const deletedCountry = await this.CategoryModel
            .findByIdAndUpdate(
                id,
                { $set: { status: 'DELETED' } },
                { new: true }
            )
            .lean()
            .exec();
        return deletedCountry
    }
}