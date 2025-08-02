import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SubCategory } from './subCategory.schema';
import { CreateSubCategoryDto } from './dto/createSubcategory.dto';
import { UpdatedSubCategoryDto } from './dto/updateSubcategory.dto';
import * as _ from 'lodash';

@Injectable()
export class SubCategoryService {
    constructor(
        @InjectModel(SubCategory.name) private SupCategoryModel: Model<SubCategory>,
    ) { }

    /**
     * Create subcategory
     * @param createSubCategoryDto
     * @returns object
     */
    async create(createSubCategoryDto: CreateSubCategoryDto): Promise<SubCategory> {
        try {
            const createdState = new this.SupCategoryModel(createSubCategoryDto);
            const data = await createdState.save();
            return data
        } catch (error) {
            console.error("Validation Error:", error);
            throw new Error(`${error.message}`);
        }
    }

    /**
     * Get all subcategory details
     * @param queryParams
     * @returns array of objects
     */
    async findAll(queryParams: any) {
        const limit = Number(queryParams.limit)
        const page = Number(queryParams.page)
        const skipValue = Number(page - 1) * limit
        const match: any = { status: 'ACTIVE' }

        if (queryParams.status) {
            match.status = queryParams.status;
        }

        if (queryParams.categoryId) {
            match.categoryId = { $eq: queryParams.categoryId };
        }

        if (queryParams.subCategoryName) {
            match.subCategoryName = { $regex: new RegExp(queryParams.subCategoryName, 'i') };
        }

        const StateList = await this.SupCategoryModel.find(match).populate('categoryId', 'id categoryName').sort({ createdAt: -1 }).skip(skipValue).limit(limit).exec();
        const count = await this.SupCategoryModel.countDocuments(match).exec()
        return { StateList, count };
    }

    /**
     * Find subcategory by id
     * @param id
     * @returns object
     */
    async findById(id: string): Promise<SubCategory> {
        return this.SupCategoryModel.findById(id).exec();
    }

    /**
     * Find subcategory by name
     * @param subCategoryName
     * @returns object
     */
    async findByName(subCategoryName: string): Promise<SubCategory | null> {
        return await this.SupCategoryModel.findOne({ subCategoryName: subCategoryName, status: { $ne: 'DELETED' } }).exec();
    }

    /**
     * Find subcategory by name using id
     * @param subCategoryName
     * @param id
     * @returns object
     */
    async findByNameButId(subCategoryName: string, id: string): Promise<SubCategory | null> {
        return await this.SupCategoryModel.findOne({ subCategoryName: subCategoryName, _id: { $ne: id }, status: { $ne: 'DELETED' } }).exec();
    }

    /**
     * Update subcategory by id
     * @param id
     * @param updatedSubCategoryDto
     * @returns object
     */
    async update(id: string, updatedSubCategoryDto: UpdatedSubCategoryDto): Promise<SubCategory> {
        return this.SupCategoryModel.findOneAndUpdate({ _id: id }, updatedSubCategoryDto).exec();
    }

    /**
     * Delete subcategory by id
     * @param id
     * @returns object
     */
    async delete(id: string): Promise<SubCategory> {
        const deletedState = await this.SupCategoryModel
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