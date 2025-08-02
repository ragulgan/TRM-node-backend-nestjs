import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { District } from './district.schema';
import { CreateDistrictDto } from './dto/createDistrict.dto';
import { UpdatedDistrictDto } from './dto/updateDistrict.dto';
import * as _ from 'lodash';

@Injectable()
export class DistrictService {
    constructor(
        @InjectModel(District.name) private DistrictModel: Model<District>,
    ) { }

    /**
     * Create new district
     * @param createDistrictDto
     * @returns object
     */
    async create(createDistrictDto: CreateDistrictDto): Promise<District> {
        try {
            const createdState = new this.DistrictModel(createDistrictDto);
            const data = await createdState.save();
            return data
        } catch (error) {
            console.error("Validation Error:", error);
            throw new Error(`${error.message}`);
        }
    }

    /**
     * Get all district list
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

        if (queryParams.stateId) {
            match.stateId = { $eq: queryParams.stateId };
        }

        if (queryParams.districtName) {
            match.districtName = { $regex: new RegExp(queryParams.districtName, 'i') };
        }

        const StateList = await this.DistrictModel.find(match).populate('stateId', 'id stateName').sort({ createdAt: -1 }).skip(skipValue).limit(limit).exec();
        const count = await this.DistrictModel.countDocuments(match).exec()
        return { StateList, count };
    }

    /**
     * Find district by id
     * @param id
     * @returns object
     */
    async findById(id: string): Promise<District> {
        return this.DistrictModel.findById(id).exec();
    }

    /**
     * Find district by it's name
     * @param districtName
     * @returns object
     */
    async findByName(districtName: string): Promise<District | null> {
        return await this.DistrictModel.findOne({ districtName: districtName, status: { $ne: 'DELETED' } }).exec();
    }

    /**
     * Find district by it's name also pass id param
     * @param districtName
     * @param id
     * @returns object
     */
    async findByNameButId(districtName: string, id: string): Promise<District | null> {
        return await this.DistrictModel.findOne({ districtName: districtName, _id: { $ne: id }, status: { $ne: 'DELETED' } }).exec();
    }

    /**
     * Update district details by id
     * @param id
     * @param updatedDistrictDto
     * @returns object
     */
    async update(id: string, updatedDistrictDto: UpdatedDistrictDto): Promise<District> {
        return this.DistrictModel.findOneAndUpdate({ _id: id }, updatedDistrictDto).exec();
    }

    /**
     * Delete district by id
     * @param id
     * @returns object
     */
    async delete(id: string): Promise<District> {
        const deletedState = await this.DistrictModel
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