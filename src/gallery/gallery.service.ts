import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Gallery } from './gallery.schema';
import { CreateGalleryDto } from './dto/createGallery.dto';
import { UpdatedGalleryDto } from './dto/updateGallery.dto';
const mongoose = require('mongoose');
import * as _ from 'lodash';

@Injectable()
export class GalleryService {
    constructor(
        @InjectModel(Gallery.name) private GalleryModel: Model<Gallery>,
    ) { }

    /**
     * Create gallery
     * @param createGalleryDto
     * @returns object
     */
    async create(createGalleryDto: CreateGalleryDto): Promise<Gallery> {
        try {
            const createdGallery = new this.GalleryModel(createGalleryDto);
            const saveGallery = await createdGallery.save();
            return saveGallery;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }

    /**
     * Get gallery list
     * @param queryParams
     * @returns array of objects
     */
    async findAll(queryParams: any) {
        const limit = Number(queryParams.limit)
        const page = Number(queryParams.page)
        const skipValue = Number(page - 1) * limit
        const match: any = { status: 'ACTIVE' }
        if (queryParams.title) {
            match.title = new RegExp(queryParams.title, 'i');
        }

        if (queryParams.eventName) {
            match.eventName = new RegExp(queryParams.eventName, 'i');
        }

        if (queryParams.status) {
            match.status = queryParams.status;
        }
        const GalleryList = await this.GalleryModel.find(match).sort({ createdAt: -1 }).skip(skipValue).limit(limit).exec();
        const count = await this.GalleryModel.countDocuments(match).exec()
        return { GalleryList, count };
    }

    /**
     * Get all gallery list as ascending order
     * @param queryParams
     * @returns array of objects
     */
    async findAllAscending(queryParams: any) {
        const limit = Number(queryParams.limit)
        const page = Number(queryParams.page)
        const skipValue = Number(page - 1) * limit
        const match: any = { status: 'ACTIVE' }
        const GalleryList = await this.GalleryModel.find(match).sort({ createdAt: 1 }).skip(skipValue).limit(limit).exec();
        const count = await this.GalleryModel.countDocuments(match).exec()
        return { GalleryList, count };
    }

    /**
     * Find gallery by id
     * @param id
     * @returns object
     */
    async findById(id: string): Promise<Gallery> {
        return this.GalleryModel.findById(id).exec();
    }

    /**
     * Find gallery by name
     * @param title
     * @returns object
     */
    async findByName(title: string): Promise<Gallery | null> {
        return await this.GalleryModel.findOne({ title: title, status: { $ne: 'DELETED' } }).exec();
    }

    /**
     * Find gallery by name and id
     * @param title
     * @param id
     * @returns object
     */
    async findByNameButId(title: string, id: string): Promise<Gallery | null> {
        return await this.GalleryModel.findOne({ title: title, _id: { $ne: id }, status: { $ne: 'DELETED' } }).exec();
    }

    /**
     * Update gallery by id
     * @param id
     * @param updatedGalleryDto
     * @returns object
     */
    async update(id: string, updatedGalleryDto: UpdatedGalleryDto): Promise<Gallery> {
        try {
            const updatGallery = await this.GalleryModel.findOneAndUpdate({ _id: id }, updatedGalleryDto).exec();
            return updatGallery
        } catch (error) {
            throw new Error("Error occurred while updating Gallery.");
        }
    }

    /**
     * Delete gallery by id
     * @param id
     * @returns object
     */
    async delete(id: string): Promise<Gallery> {
        const deleteGallery = await this.GalleryModel
            .findByIdAndUpdate(
                id,
                { $set: { status: 'DELETED' } },
                { new: true }
            )
            .lean()
            .exec();
        return deleteGallery;
    }
}