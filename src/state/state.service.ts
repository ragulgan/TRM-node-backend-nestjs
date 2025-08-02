import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { State } from './state.schema';
import { CreateStateDto } from './dto/createState.dto';
import { UpdatedStateDto } from './dto/updateState.dto';
import * as _ from 'lodash';

@Injectable()
export class StateService {
    constructor(
        @InjectModel(State.name) private StateModel: Model<State>,
    ) { }

    /**
     * Create state
     * @param createStateDto
     * @returns object
     */
    async create(createStateDto: CreateStateDto): Promise<State> {
        try {
            const createdCountry = new this.StateModel(createStateDto);
            const data = await createdCountry.save();
            return data
        } catch (error) {
            console.error("Validation Error:", error);
            throw new Error(`${error.message}`);
        }
    }

    /**
     * Get all states
     * @param queryParams
     * @returns array of objects
     */
    async findAll(queryParams: any) {
        const limit = Number(queryParams.limit)
        const page = Number(queryParams.page)
        const skipValue = Number(page - 1) * limit
        let match: any = { status: 'ACTIVE' }

        if (queryParams.stateName) {
            const orCondition = []
            if (queryParams.stateName) {
                orCondition.push({
                    stateName: new RegExp(`${queryParams.stateName}`, 'i')
                });
            }
            match = { ...match, $or: orCondition }
        }

        if (queryParams.status) {
            match.status = queryParams.status;
        }

        const CountryList = await this.StateModel.find(match).sort({ createdAt: -1 }).skip(skipValue).limit(limit).exec();
        const count = await this.StateModel.countDocuments(match).exec()
        return { CountryList, count };
    }

    /**
     * Find state by id
     * @param id
     * @returns object
     */
    async findById(id: string): Promise<State> {
        return this.StateModel.findById(id).exec();
    }

    /**
     * Find state by name
     * @param stateName
     * @returns object
     */
    async findByName(stateName: string): Promise<State | null> {
        return await this.StateModel.findOne({ $or: [{ stateName: stateName }], status: { $ne: 'DELETED' } }).exec();
    }

    /**
     * Find state by name using id
     * @param stateName
     * @param id
     * @returns object
     */
    async findByNameButId(stateName: string, id: string): Promise<State | null> {
        return await this.StateModel.findOne({ $or: [{ stateName: stateName }], _id: { $ne: id }, status: { $ne: 'DELETED' } }).exec();
    }

    /**
     * Update state by id
     * @param id
     * @param updatedStateDto
     * @returns object
     */
    async update(id: string, updatedStateDto: UpdatedStateDto): Promise<State> {
        return this.StateModel.findOneAndUpdate({ _id: id }, updatedStateDto).exec();
    }

    /**
     * Delete state by id
     * @param id
     * @returns object
     */
    async delete(id: string): Promise<State> {
        const deletedCountry = await this.StateModel
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