import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AboutUs } from './aboutUs.schema';
import { CreateAboutUsDto } from './dto/createAboutUs.dto';
import { UpdatedAboutUsDto } from './dto/updateAboutUs.dto';
const mongoose = require('mongoose');
import * as _ from 'lodash';

@Injectable()
export class AboutUsService {
    constructor(
        @InjectModel(AboutUs.name) private AboutUsModel: Model<AboutUs>,
    ) { }

    /**
     * Creating About Us section
     * @param createAboutUsDto
     * @returns object
     */
    async create(createAboutUsDto: CreateAboutUsDto): Promise<AboutUs> {
        try {
            const createdAboutUs = new this.AboutUsModel(createAboutUsDto);
            const saveAboutus = await createdAboutUs.save();
            return saveAboutus;
        } catch (error) {
            throw new Error("Validation Error occurred while saving Gallery.");
        }
    }

    /**
     * Find all about us details
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

        if (queryParams.status) {
            match.status = queryParams.status;
        }

        const GalleryList = await this.AboutUsModel.find(match)
        .sort({ createdAt: -1 })
        .skip(skipValue)
        .limit(limit)
        .exec();
        const count = await this.AboutUsModel.countDocuments(match).exec();
        return { GalleryList, count };
    }

    /**
     * Find by Id to pass the about us _id as param
     * @param id
     * @returns object
     */
    async findById(id: string): Promise<AboutUs> {
        return this.AboutUsModel.findById(id).exec();
    }

    /**
     * Update by Id to pass id as first param also data in second param
     * @param id
     * @param updatedAboutUsDto
     * @returns object
     */
    async update(id: string, updatedAboutUsDto: UpdatedAboutUsDto): Promise<AboutUs> {
        try {
            const updatGallery =  await this.AboutUsModel.findOneAndUpdate({ _id: id }, updatedAboutUsDto).exec();
            return updatGallery
        } catch (error) {
            throw new Error("Error occurred while updating section.");
        }
    }

    /**
     * To pass the delete _id as param
     * @param id
     * @returns object
     */
    async delete(id: string): Promise<AboutUs> {
        const updatedGallery = await this.AboutUsModel
        .findByIdAndUpdate(
            id,
            { $set: { status: 'DELETED' } },
            { new: true }
        )
        .lean()
        .exec();
        return updatedGallery
    }

}