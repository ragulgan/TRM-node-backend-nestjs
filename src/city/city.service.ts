import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { City } from './city.schema';
import { CreateCityDto } from './dto/createCity.dto';
import { UpdatedCityDto } from './dto/updateCity.dto';
import * as _ from 'lodash';

@Injectable()
export class CityService {
    constructor(
        @InjectModel(City.name) private CityModel: Model<City>,
    ) { }

    /**
     * Create city
     * @param createCityDto
     * @returns object
     */
    async create(createCityDto: CreateCityDto): Promise<City> {
        try {
            const createdCity = new this.CityModel(createCityDto);
            const data = await createdCity.save();
            return data
        } catch (error) {
            console.error("Validation Error:", error);
            throw new Error(`${error.message}`);
        }
    }

    /**
     * Get all city list
     * @param queryParams
     * @returns object
     */
    async findAll(queryParams: any) {
        const limit = Number(queryParams.limit)
        const page = Number(queryParams.page)
        const skipValue = Number(page - 1) * limit
        const match: any = { status: 'ACTIVE' }
        if (queryParams.status) {
            match.status = queryParams.status;
        }

        if (queryParams.districtId) {
            match.districtId = { $eq: queryParams.districtId };
        }

        if (queryParams.stateId) {
            match.stateId = { $eq: queryParams.stateId };
        }

        if (queryParams.cityName) {
            match.cityName = { $regex: new RegExp(queryParams.cityName, 'i') };
        }

        const CityList = await this.CityModel.find(match)
            .populate('districtId', 'id districtName')
            .populate('stateId', 'id stateName')
            .sort({ createdAt: -1 }).skip(skipValue).limit(limit).exec();
        const count = await this.CityModel.countDocuments(match).exec()
        return { CityList, count };
    }

    /**
     * To find by city name
     * @param cityName
     * @returns object
     */
    async findByName(cityName: string): Promise<City | null> {
        return await this.CityModel.findOne({ cityName: cityName, status: { $ne: 'DELETED' } }).exec();
    }

    /**
     * To find by city name with id
     * @param cityName
     * @param id
     * @returns object
     */
    async findByNameButId(cityName: string, id: string): Promise<City | null> {
        return await this.CityModel.findOne({ cityName: cityName, _id: { $ne: id }, status: { $ne: 'DELETED' } }).exec();
    }

    /**
     * To find city by id
     * @param id
     * @returns object
     */
    async findById(id: string): Promise<City> {
        return this.CityModel.findById(id).exec();
    }

    /**
     * Update city by id
     * @param id
     * @param updatedCityDto
     * @returns object
     */
    async update(id: string, updatedCityDto: UpdatedCityDto): Promise<City> {
        return this.CityModel.findOneAndUpdate({ _id: id }, updatedCityDto).exec();
    }

    /**
     * Delete city by id
     * @param id
     * @returns object
     */
    async delete(id: string): Promise<City> {
        const deletedCity = await this.CityModel
            .findByIdAndUpdate(
                id,
                { $set: { status: 'DELETED' } },
                { new: true }
            )
            .lean()
            .exec();
        return deletedCity
    }

}