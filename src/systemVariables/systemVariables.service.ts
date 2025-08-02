import { Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SystemVariables } from './systemVariables.schema';
import { CreateSystemVariablesDto } from './dto/createSystemVariables.dto';
import { UpdatedSystemVariablesDto } from './dto/updateSystemVariables.dto';
import * as _ from 'lodash';

@Injectable()
export class SystemVariablesService {
    constructor(
        @InjectModel(SystemVariables.name) private SystemVariablesModel: Model<SystemVariables>,
    ) { }

    /**
     * Create system variable for default method access
     * @param createSystemVariablesDto
     * @returns object
     */
    async create(createSystemVariablesDto: CreateSystemVariablesDto): Promise<SystemVariables> {
        try {
            const createdSystemVariables = new this.SystemVariablesModel(createSystemVariablesDto);
            const data = await createdSystemVariables.save();
            return data
        } catch (error) {
            console.error("Validation Error:", error);
            throw new Error(`${error.message}`);
        }
    }

    /**
     * Get all system variable details
     * @param queryParams
     * @returns array of objects
     */
    async findAll(queryParams: any) {
        const limit = Number(queryParams.limit)
        const page = Number(queryParams.page)
        const skipValue = Number(page - 1) * limit
        let match: any = { status: 'ACTIVE' }

        if (queryParams.name || queryParams.value) {
            const orCondition = []
            if (queryParams.name) {
                orCondition.push({
                    name: new RegExp(`${queryParams.name}`, 'i')
                });
            }

            if (queryParams.value) {
                orCondition.push({
                    value: Number(queryParams.value)
                });
            }

            if (queryParams.status) {
                orCondition.push({
                    status: Number(queryParams.status)
                });
            }
            match = { ...match, $or: orCondition }
        }

        if (queryParams.status) {
            match.status = queryParams.status;
        }

        const SystemVariablesList = await this.SystemVariablesModel.find(match).sort({ createdAt: -1 }).skip(skipValue).limit(limit).exec();
        const count = await this.SystemVariablesModel.countDocuments(match).exec()
        return { SystemVariablesList, count };
    }

    /**
     * Find system variable by id
     * @param id
     * @returns object
     */
    async findById(id: string): Promise<SystemVariables> {
        return this.SystemVariablesModel.findById(id).exec();
    }

    /**
     * Find system variable by name
     * @param name
     * @returns object
     */
    async findByName(name: string): Promise<SystemVariables | null> {
        return await this.SystemVariablesModel.findOne({ name: name, status: { $ne: 'DELETED' } }).exec();
    }

    /**
     * Find system variable by name using id
     * @param name
     * @param id
     * @returns object
     */
    async findByNameButId(name: string, id: string): Promise<SystemVariables | null> {
        return await this.SystemVariablesModel.findOne({ name: name, _id: { $ne: id }, status: { $ne: 'DELETED' } }).exec();
    }

    /**
     * Update system variable by id
     * @param id
     * @param updatedSystemVariablesDto
     * @returns object
     */
    async update(id: string, updatedSystemVariablesDto: UpdatedSystemVariablesDto): Promise<SystemVariables> {
        return this.SystemVariablesModel.findOneAndUpdate({ _id: id }, updatedSystemVariablesDto).exec();
    }

    /**
     * Delete system variable by id
     * @param id
     * @returns object
     */
    async delete(id: string): Promise<SystemVariables> {
        const deletedSystemVariables = await this.SystemVariablesModel
            .findOneAndUpdate(
                { _id: id },
                { $set: { status: 'DELETED' } },
                { new: true }
            )
            .exec();
        return deletedSystemVariables;
    }

}