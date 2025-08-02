import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { NewsAndEvents } from './newsandevents.schema';
import { CreateNewsAndEventsDto } from './dto/createNewsAndEvents.dto';
import { UpdatedNewsAndEventsDto } from './dto/updateNewsAndEvents.dto';
const mongoose = require('mongoose');
import * as _ from 'lodash';

@Injectable()
export class NewsAndEventsService {
    constructor(
        @InjectModel(NewsAndEvents.name) private NewsAndEventsModel: Model<NewsAndEvents>,
    ) { }

    /**
     * Create news and events
     * @param createNewsAndEventsDto
     * @returns object
     */
    async create(createNewsAndEventsDto: CreateNewsAndEventsDto): Promise<NewsAndEvents> {
        try {
            const createdNewsAndEvents = new this.NewsAndEventsModel(createNewsAndEventsDto);
            const saveNewsAndEvents = await createdNewsAndEvents.save();
            return saveNewsAndEvents;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    /**
     * Get news and event list
     * @param queryParams
     * @returns array of objects
     */
    async findAll(queryParams: any) {
        const limit = Number(queryParams.limit) || 10;
        const page = Number(queryParams.page) || 1;
        const skipValue = Number(page - 1) * limit
        const match: any = { status: 'ACTIVE' }

        if (queryParams.title) {
            match.title = new RegExp(queryParams.title, 'i');
        }

        if (queryParams.status) {
            match.status = queryParams.status;
        }

        const NewsAndEventsList = await this.NewsAndEventsModel.find(match).sort({ createdAt: -1 }).skip(skipValue).limit(limit).exec();
        const count = await this.NewsAndEventsModel.countDocuments(match).exec()
        return { NewsAndEventsList, count };
    }

    /**
     * Get all news and event by ascending order
     * @param queryParams
     * @returns array of objects
     */
    async findAllAscending(queryParams: any) {
        const limit = Number(queryParams.limit)
        const page = Number(queryParams.page)
        const skipValue = Number(page - 1) * limit
        const match: any = { status: 'ACTIVE' }
        const NewsAndEventsList = await this.NewsAndEventsModel.find(match).sort({ createdAt: 1 }).skip(skipValue).limit(limit).exec();
        const count = await this.NewsAndEventsModel.countDocuments(match).exec()
        return { NewsAndEventsList, count };
    }

    /**
     * Find news and event by id
     * @param id
     * @returns object
     */
    async findById(id: string): Promise<NewsAndEvents> {
        return this.NewsAndEventsModel.findById(id).exec();
    }

    /**
     * Update news and event by id
     * @param id
     * @param updatedNewsAndEventsDto
     * @returns object
     */
    async update(id: string, updatedNewsAndEventsDto: UpdatedNewsAndEventsDto): Promise<NewsAndEvents> {
        try {
            const updatNewsAndEvents = await this.NewsAndEventsModel.findOneAndUpdate({ _id: id }, updatedNewsAndEventsDto).exec();
            return updatNewsAndEvents
        } catch (error) {
            throw new Error("Error occurred while updating NewsAndEvents.");
        }
    }

    /**
     * Delete news and event by id
     * @param id
     * @returns object
     */
    async delete(id: string): Promise<NewsAndEvents> {
        const updatedNewsAndEvents = await this.NewsAndEventsModel
            .findByIdAndUpdate(
                id,
                { $set: { status: 'DELETED' } },
                { new: true }
            )
            .lean()
            .exec();
        return updatedNewsAndEvents;
    }
}