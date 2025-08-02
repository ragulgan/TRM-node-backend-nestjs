import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Welcome } from './welcome.schema';
import { CreateWelcomeDto } from './dto/createWelcome.dto';
import { UpdatedWelcomeDto } from './dto/updateWelcome.dto ';
import * as _ from 'lodash';

@Injectable()
export class WelcomeService {
    constructor(
        @InjectModel(Welcome.name) private WelcomesModel: Model<Welcome>,
    ) { }

    /**
     * Create welcome session
     * @param createWelcomeDto
     * @returns object
     */
    async create(createWelcomeDto: CreateWelcomeDto): Promise<Welcome> {
        try {
            const createdWelcome = new this.WelcomesModel(createWelcomeDto);
            const data = await createdWelcome.save();
            return data
        } catch (error) {
            console.error("Validation Error:", error);
            throw new Error(`${error.message}`);
        }
    }

    /**
     * Get all welcome list
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

        if (queryParams.title) {
            match.title = queryParams.title
        }

        if (queryParams.bannerType) {
            match.bannerType = queryParams.bannerType
        }

        const WelcomeList = await this.WelcomesModel.find(match).sort({ createdAt: -1 }).skip(skipValue).limit(limit).exec();
        const count = await this.WelcomesModel.countDocuments(match).exec()
        return { WelcomeList, count };
    }

    /**
     * Find by id
     * @param id
     * @returns object
     */
    async findById(id: string): Promise<Welcome> {
        return this.WelcomesModel.findById(id).exec();
    }

    /**
     * Find by title
     * @param title
     * @returns object
     */
    async findByTitle(title: string): Promise<Welcome | null> {
        return await this.WelcomesModel.findOne({ title: title, status: { $ne: 'DELETED' } }).exec();
    }

    /**
     * Find by title also use id
     * @param title
     * @param id
     * @returns object
     */
    async findByTitleButId(title: string, id: string): Promise<Welcome | null> {
        return await this.WelcomesModel.findOne({ title: title, _id: { $ne: id }, status: { $ne: 'DELETED' } }).exec();
    }

    /**
     * Update by id
     * @param id
     * @param updatedWelcomeDto
     * @returns object
     */
    async update(id: string, updatedWelcomeDto: UpdatedWelcomeDto): Promise<Welcome> {
        return this.WelcomesModel.findOneAndUpdate({ _id: id }, updatedWelcomeDto).exec();
    }

    /**
     * Delete by id
     * @param id
     * @returns object 
     */
    async delete(id: string): Promise<Welcome> {
        const deletedWelcome = await this.WelcomesModel
            .findByIdAndUpdate(
                id,
                { $set: { status: 'DELETED' } },
                { new: true }
            )
            .lean()
            .exec();
        return deletedWelcome
    }

}