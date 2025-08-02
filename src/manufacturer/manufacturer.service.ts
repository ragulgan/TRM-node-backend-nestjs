import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Manufacturer } from './manufacturer.schema';
import { CreateManufacturerDto } from './dto/createManufacturer.dto';
import { UpdatedManufacturerDto } from './dto/updateManufacturer.dto';
import * as _ from 'lodash';

@Injectable()
export class ManufacturerService {
    constructor(
        @InjectModel(Manufacturer.name) private ManufacturerModel: Model<Manufacturer>,
    ) { }

    /**
     * Create manufacturer
     * @param createManufacturerDto
     * @returns object
     */
    async create(createManufacturerDto: CreateManufacturerDto): Promise<Manufacturer> {
        try {
            const createdManufacturer = new this.ManufacturerModel(createManufacturerDto);
            const data = await createdManufacturer.save();
            return data
        } catch (error) {
            console.error("Validation Error:", error);
            throw new Error(`${error.message}`);
        }
    }

    /**
     * Get manufacturer list
     * @param queryParams
     * @returns array of objects
     */
    async findAll(queryParams: any) {
        const limit = Number(queryParams.limit)
        const page = Number(queryParams.page)
        const skipValue = Number(page - 1) * limit
        let match: any = { status: 'ACTIVE' }

        if (queryParams.name) {
            const orCondition = []
            if (queryParams.name) {
                orCondition.push({
                    displayName: new RegExp(queryParams.name.trim(), 'i')
                });
            }
            match = { ...match, $or: orCondition }
        }

        if (queryParams.status) {
            match.status = queryParams.status;
        }

        const ManufacturerList = await this.ManufacturerModel.find(match).sort({ createdAt: 1 }).skip(skipValue).limit(limit).exec();
        const count = await this.ManufacturerModel.countDocuments(match).exec()
        return { ManufacturerList, count };
    }

    /**
     * Find manufacturer by id
     * @param id
     * @returns object
     */
    async findById(id: string): Promise<Manufacturer> {
        return this.ManufacturerModel.findById(id).exec();
    }

    /**
     * Find manufacturer by name
     * @param name
     * @returns object
     */
    async findByName(name: string): Promise<Manufacturer | null> {
        return await this.ManufacturerModel.findOne({ $or: [{ name: name }], status: { $ne: 'DELETED' } }).exec();
    }

    /**
     * Find manufacturer by id and name
     * @param name
     * @param id
     * @returns object
     */
    async findByNameButId(name: string, id: string): Promise<Manufacturer | null> {
        return await this.ManufacturerModel.findOne({ $or: [{ name: name }], _id: { $ne: id }, status: { $ne: 'DELETED' } }).exec();
    }

    /**
     * Update manufacturer by id
     * @param id
     * @param updatedManufacturerDto
     * @returns object
     */
    async update(id: string, updatedManufacturerDto: UpdatedManufacturerDto): Promise<Manufacturer> {
        return this.ManufacturerModel.findOneAndUpdate({ _id: id }, updatedManufacturerDto).exec();
    }

    /**
     * Delete manufacturer by id
     * @param id
     * @returns object
     */
    async delete(id: string): Promise<Manufacturer> {
        const deletedCountry = await this.ManufacturerModel
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