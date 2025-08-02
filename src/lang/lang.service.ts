import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Lang } from './lang.schema';
import { CreateLangDto } from './dto/createlang.dto';
import { UpdatedLangDto } from './dto/updatelang.dto';
import * as _ from 'lodash';

@Injectable()
export class LangService {
    constructor(
        @InjectModel(Lang.name) private LangModel: Model<Lang>,
    ) { }

    /**
     * Create lang
     * @param createLangDto
     * @returns object
     */
    async create(createLangDto: CreateLangDto): Promise<Lang> {
        try {
            const createdLang = new this.LangModel(createLangDto);
            return await createdLang.save();
        } catch (error) {
            console.error("Validation Error:", error);
            throw new Error("Validation Error occurred while saving Lang.");
        }
    }

    /**
     * Get all lang list
     * @param queryParams
     * @returns array of objects
     */
    async findAll(queryParams: any) {
        const limit = Number(queryParams.limit)
        const page = Number(queryParams.page)
        const skipValue = Number(page - 1) * limit
        const match: { email?: RegExp, mobileNumber?: RegExp } = {};

        if (queryParams.email) {
            match.email = new RegExp(queryParams.email, 'i')
        }

        if (queryParams.mobileNumber) {
            match.mobileNumber = new RegExp(queryParams.mobileNumber, 'i')
        }

        const LangList = await this.LangModel.find(match).sort({ createdAt: -1 }).skip(skipValue).limit(limit).exec();
        const count = await this.LangModel.countDocuments(match).exec()
        return { LangList, count };
    }

    /**
     * Find lang by name
     * @param name
     * @returns object
     */
    async findByEmail(name: string): Promise<Lang | null> {
        const Lang = await this.LangModel.findOne({ name }).exec();
        return Lang || null;
    }

    /**
     * Find lang by id
     * @param id
     * @returns object
     */
    async findById(id: string): Promise<Lang> {
        return this.LangModel.findById(id).exec();
    }

    /**
     * Update lang by id
     * @param id
     * @param updatedLangDto
     * @returns object
     */
    async update(id: string, updatedLangDto: UpdatedLangDto): Promise<Lang> {
        return this.LangModel.findOneAndUpdate({ _id: id }, updatedLangDto).exec();
    }

    /**
     * Delete lang by id
     * @param id
     * @returns object
     */
    async delete(id: string): Promise<Lang> {
        const deletedLang = await this.LangModel
            .findByIdAndUpdate(
                id,
                { $set: { status: 'DELETED' } },
                { new: true }
            )
            .lean()
            .exec();
        return deletedLang
    }
}