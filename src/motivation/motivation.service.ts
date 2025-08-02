import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Motivation } from './motivation.schema';
import { CreateMotivationDto } from './dto/createMotivation.dto';
import { UpdatedMotivationDto } from './dto/updateMotivation.dto';
import * as _ from 'lodash';

@Injectable()
export class MotivationService {
    constructor(
        @InjectModel(Motivation.name) private MotivationModel: Model<Motivation>,
    ) { }

    /**
     * Create motivation
     * @param createMotivationDto
     * @returns object
     */
    async create(createMotivationDto: CreateMotivationDto): Promise<Motivation> {
        try {
            const createdState = new this.MotivationModel(createMotivationDto);
            const data = await createdState.save();
            return data
        } catch (error) {
            console.error("Validation Error:", error);
            throw new Error(`${error}`);
        }
    }

    /**
     * Get motivation list
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
            match.title = { $regex: new RegExp(queryParams.title, 'i') };
        }

        const StateList = await this.MotivationModel.find(match).sort({ createdAt: -1 }).skip(skipValue).limit(limit).exec();
        const count = await this.MotivationModel.countDocuments(match).exec()
        return { StateList, count };
    }

    /**
     * Get motivation in ascending order
     * @param queryParams
     * @returns array of objects
     */
    async findAllAscending(queryParams: any) {
        const limit = Number(queryParams.limit)
        const page = Number(queryParams.page)
        const skipValue = Number(page - 1) * limit
        const match: any = { status: 'ACTIVE' }
        const StateList = await this.MotivationModel.find(match).sort({ createdAt: 1 }).skip(skipValue).limit(limit).exec();
        const count = await this.MotivationModel.countDocuments(match).exec()
        return { StateList, count };
    }

    /**
     * Find motivation by id
     * @param id
     * @returns object
     */
    async findById(id: string): Promise<Motivation> {
        return this.MotivationModel.findById(id).exec();
    }

    /**
     * Find motivation by name
     * @param title
     * @returns object
     */
    async findByName(title: string): Promise<Motivation | null> {
        return await this.MotivationModel.findOne({ title: title, status: { $ne: 'DELETED' } }).exec();
    }

    /**
     * Find motivation by message
     * @param message
     * @returns object
     */
    async findByMessage(message: string): Promise<Motivation | null> {
        return await this.MotivationModel.findOne({ message: message, status: { $ne: 'DELETED' } }).exec();
    }

    /**
     * Find motivation by name with id param
     * @param title
     * @param id
     * @returns object
     */
    async findByNameButId(title: string, id: string): Promise<Motivation | null> {
        return await this.MotivationModel.findOne({ title: title, _id: { $ne: id }, status: { $ne: 'DELETED' } }).exec();
    }

    /**
     * Find motivation by message with id param
     * @param message
     * @param id
     * @returns object
     */
    async findByMessageButId(message: string, id: string): Promise<Motivation | null> {
        return await this.MotivationModel.findOne({ message: message, _id: { $ne: id }, status: { $ne: 'DELETED' } }).exec();
    }

    /**
     * Update motivation by id
     * @param id
     * @param updatedMotivationDto
     * @returns object
     */
    async update(id: string, updatedMotivationDto: UpdatedMotivationDto): Promise<Motivation> {
        return this.MotivationModel.findOneAndUpdate({ _id: id }, updatedMotivationDto).exec();
    }

    /**
     * Delete motivation by id
     * @param id
     * @returns
     */
    async delete(id: string): Promise<Motivation> {
        const deletedState = await this.MotivationModel
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