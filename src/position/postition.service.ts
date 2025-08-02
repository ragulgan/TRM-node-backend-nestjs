import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Position } from './position.schema';
import { CreatePositionDto } from './dto/createPosition.dto';
import { UpdatedPositionDto } from './dto/updatePosition.dto';
import * as _ from 'lodash';

@Injectable()
export class PositionService {
    constructor(
        @InjectModel(Position.name) private PositionModel: Model<Position>,
    ) { }

    /**
     * Create position
     * @param createPositionDto
     * @returns object
     */
    async create(createPositionDto: CreatePositionDto): Promise<Position> {
        try {
            const match: any = { status: 'ACTIVE' }
            const maxDisplayOrder = await this.PositionModel.findOne(match)
                .sort({ displayOrder: -1 })
                .select('displayOrder')
                .exec();
            const displayOrder = maxDisplayOrder ? maxDisplayOrder.displayOrder + 1 : 1;
            const data = {
                ...createPositionDto,
                displayOrder
            }
            const createdPosition = await this.PositionModel.create(data);
            return createdPosition;
        } catch (error) {
            console.error("Validation Error:", error);
            throw new Error(`${error}`);
        }
    }

    /**
     * Get position list
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

        if (queryParams.position) {
            match.position = { $regex: new RegExp(queryParams.position, 'i') };
        }

        const StateList = await this.PositionModel.find(match).sort({ displayOrder: 1 }).skip(skipValue).limit(limit).exec();
        const count = await this.PositionModel.countDocuments(match).exec()
        return { StateList, count };
    }

    /**
     * Find position by id
     * @param id
     * @returns object
     */
    async findById(id: string): Promise<Position> {
        return this.PositionModel.findById(id).exec();
    }

    /**
     * Find by position name
     * @param position
     * @returns object
     */
    async findByName(position: string): Promise<Position | null> {
        return await this.PositionModel.findOne({ position: position, status: { $ne: 'DELETED' } }).exec();
    }

    /**
     * Find by position name using with id
     * @param position
     * @param id
     * @returns object
     */
    async findByNameButId(position: string, id: string): Promise<Position | null> {
        return await this.PositionModel.findOne({ position: position, _id: { $ne: id }, status: { $ne: 'DELETED' } }).exec();
    }

    /**
     * Update position by id
     * @param id
     * @param updatedPositionDto
     * @returns object
     */
    async update(id: string, updatedPositionDto: UpdatedPositionDto): Promise<Position> {
        return this.PositionModel.findOneAndUpdate({ _id: id }, updatedPositionDto).exec();
    }

    /**
     * Delete position by id
     * @param id
     * @returns object
     */
    async delete(id: string): Promise<Position> {
        const deletedState = await this.PositionModel
            .findByIdAndUpdate(
                id,
                { $set: { status: 'DELETED' } },
                { new: true }
            )
            .lean()
            .exec();
        return deletedState;
    }
}