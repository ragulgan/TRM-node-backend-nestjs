import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Promotion } from './promotion.schema';
import { CreatePromotioDto } from './dto/createPromotion.dto';
import { UpdatedPromotioDto } from './dto/updatePromotion.dto';
import { AdvertisementEnquiryDto } from './dto/advertisementEnquiry.dto'
import { UpdateAdvertiseEnquiryDto } from './dto/advertisementEnquiryUpdate.dto'
import { PromotionEnquiry } from './promotionEnquiry.schema';
import { EmailService } from '../emailService/emailService.service'
import { Role } from '../role/schema';
import * as _ from 'lodash';

@Injectable()
export class PromotionService {
    constructor(
        @InjectModel(Promotion.name) private PromotionModel: Model<Promotion>,
        @InjectModel(PromotionEnquiry.name) private PromotionEnquiryModel: Model<PromotionEnquiry>,
        @InjectModel(Role.name) private roleModel: Model<Role>,
        private readonly emailService: EmailService,
    ) { }

    /**
     * Create advertisement
     * @param createPromotionDto
     * @returns object
     */
    async create(createPromotionDto: CreatePromotioDto): Promise<Promotion> {
        try {
            const createdState = new this.PromotionModel(createPromotionDto);
            const data = await createdState.save();
            return data
        } catch (error) {
            console.error("Validation Error:", error);
            throw new Error(`${error.message}`);
        }
    }

    /**
     * To send mail to that advertisement product
     * @param productEnquiryDto
     * @returns object
     */
    async createAdvertisementEnquiry(productEnquiryDto: AdvertisementEnquiryDto): Promise<PromotionEnquiry> {
        try {
            const templateData = {
                "name": productEnquiryDto.ownerName,
                "message": productEnquiryDto.message,
                "companyName": productEnquiryDto.companyName,
                "email": productEnquiryDto.fromEmail,
                "mobileNumber": productEnquiryDto.mobileNumber,
                "district": productEnquiryDto.district,
                "city": productEnquiryDto.city,
                "productOwnername": productEnquiryDto.productOwnername,
                "productName": productEnquiryDto.productName
            }
            await this.emailService.sendMail(
                productEnquiryDto.toEmail,
                "Enquiry about the product details.",
                `${productEnquiryDto.role}`,
                templateData
            ).then(() => { })
        } catch (error) {
            console.log("Error sending product enquiry mail:", error);
            throw new Error("Error mail not sent.");
        }
        return this.PromotionEnquiryModel.create(productEnquiryDto);
    }

    /**
     * To list all advertisement
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
            match.addTitle = { $regex: new RegExp(queryParams.title, 'i') };
        }

        const StateList = await this.PromotionModel.find(match)
        .sort({ createdAt: -1 })
        .populate('category', 'id categoryName')
        .populate('userId', 'id ownerName contactPersonName companyName companyImage email')
        .populate('role', 'id role')
        .skip(skipValue)
        .limit(limit)
        .exec();
        const count = await this.PromotionModel.countDocuments(match).exec()
        return { StateList, count };
    }

    /**
     * To list all advertisement as Ascending order
     * @param queryParams
     * @returns array of objects
     */
    async findAllAscending(queryParams: any) {
        const limit = Number(queryParams.limit)
        const page = Number(queryParams.page)
        const skipValue = Number(page - 1) * limit
        const match: any = { status: 'ACTIVE' }

        const StateList = await this.PromotionModel.find(match)
        .sort({ createdAt: 1 })
        .populate('category', 'id categoryName')
        .populate('role', 'id role')
        .populate('userId', 'id ownerName contactPersonName companyName companyImage email')
        .skip(skipValue)
        .limit(limit)
        .exec();

        const count = await this.PromotionModel.countDocuments(match).exec()
        return { StateList, count };
    }

    /**
     * To list all advertisement product enquiry details
     * @param queryParams
     * @returns array of objects
     */
    async findAllAdvertisementEnquiry(queryParams: any) {
        const limit = Number(queryParams.limit)
        const page = Number(queryParams.page)
        const skipValue = Number(page - 1) * limit
        let match: any = { status: 'UNRESOLVE' }

        if (queryParams.ownerName || queryParams.fromEmail || queryParams.toEmail || queryParams.mobileNumber || queryParams.productOwnername || queryParams.productName) {
            const orCondition = []
            if (queryParams.ownerName) {
                orCondition.push({
                ownerName: new RegExp(`${queryParams.ownerName}`, 'i')
                });
            }

            if (queryParams.fromEmail) {
                orCondition.push({
                    fromEmail: new RegExp(`${queryParams.fromEmail}`, 'i')
                });
            }

            if (queryParams.toEmail) {
                orCondition.push({
                    toEmail: new RegExp(`${queryParams.toEmail}`, 'i')
                });
            }

            if (queryParams.mobileNumber) {
                orCondition.push({
                    mobileNumber: new RegExp(`${queryParams.mobileNumber}`, 'i')
                });
            }

            if (queryParams.productOwnername) {
                orCondition.push({
                    productOwnername: new RegExp(`${queryParams.productOwnername}`, 'i')
                });
            }

            if (queryParams.productName) {
                orCondition.push({
                    productName: new RegExp(`${queryParams.productName}`, 'i')
                });
            }

            match = { ...match, $or: orCondition }
        }

        if (queryParams.companyName) {
            match.companyName = { $regex: new RegExp(queryParams.companyName, 'i') };
        }

        if (queryParams.district) {
            match.district = { $regex: new RegExp(queryParams.district, 'i') };
        }

        if (queryParams.city) {
            match.city = { $regex: new RegExp(queryParams.city, 'i') };
        }

        if (queryParams.status) {
            match.status = queryParams.status;
        }

        if (queryParams.createdAt) {
            match.createdAt = queryParams.createdAt;
        }

        if (queryParams.role) {
            match.role = { $regex: new RegExp(queryParams.role, 'i') };
        }

        const advertisementEnquiryList = await this.PromotionEnquiryModel.find(match)
        .sort({ createdAt: -1 })
        .skip(skipValue)
        .limit(limit)
        .exec();

        const count = await this.PromotionEnquiryModel.countDocuments(match).exec()
        return { advertisementEnquiryList, count };
    }

    /**
     * To pass id as param to get particular advertisement enquiry details (enquiry person details and product details)
     * @param id
     * @returns object
     */
    async findByIdAdvertiseEnquiry(id: string): Promise<PromotionEnquiry> {
        return this.PromotionEnquiryModel.findById(id).exec();
    }

    /**
     * To pass id as param to get particular advertisement details
     * @param id
     * @returns object
     */
    async findById(id: string): Promise<Promotion> {
        return this.PromotionModel.findById(id).populate('category', 'id categoryName').populate('role', 'id role').populate('userId', 'id ownerName contactPersonName companyName companyImage email').exec();
    }

    /**
     * To find by advertisement title to restrict duplication entry while we create new advertisement with same title
     * @param addTitle
     * @returns object
     */
    async findByName(addTitle: string): Promise<Promotion | null> {
        return await this.PromotionModel.findOne({ addTitle: addTitle, status: { $ne: 'DELETED' } }).exec();
    }

    /**
     * To find by advertisement description to restrict duplication entry while we create new advertisement with same description
     * @param description
     * @returns object
     */
    async findByDescription(description: string): Promise<Promotion | null> {
        return await this.PromotionModel.findOne({ description: description, status: { $ne: 'DELETED' } }).exec();
    }

    /**
     * To find by id also advertisement title while update same advertisement title entry another advertisement we restirct
     * first param addTitle second param id
     * @param addTitle
     * @param id
     * @returns object
     */
    async findByNameButId(addTitle: string, id: string): Promise<Promotion | null> {
        return await this.PromotionModel.findOne({ addTitle: addTitle, _id: { $ne: id }, status: { $ne: 'DELETED' } }).exec();
    }

    /**
     * To find by id also advertisement description while update same advertisement description entry another advertisement we restirct
     * first param description second param id
     * @param description
     * @param id
     * @returns object
     */
    async findByDescriptionButId(description: string, id: string): Promise<Promotion | null> {
        return await this.PromotionModel.findOne({ description: description, _id: { $ne: id }, status: { $ne: 'DELETED' } }).exec();
    }

    /**
     * update advertisement detail
     * @param id
     * @param updatedPromotionDto
     * @returns object
     */
    async update(id: string, updatedPromotionDto: UpdatedPromotioDto): Promise<Promotion> {
        return this.PromotionModel.findOneAndUpdate({ _id: id }, updatedPromotionDto).exec();
    }

    /**
     * update advertisement enquiry status
     * @param id
     * @param updatedAdvertiseEnquiryDto
     * @returns object
     */
    async updateAdvertisementEnquiry(id: string, updatedAdvertiseEnquiryDto: UpdateAdvertiseEnquiryDto): Promise<PromotionEnquiry> {
        const updateData = {
            status: updatedAdvertiseEnquiryDto.status,
        };
        return this.PromotionEnquiryModel.findOneAndUpdate({ _id: id }, updateData, { new: true }).exec();
    }

    /**
     * delete advertisement details
     * @param id
     * @returns object
     */
    async delete(id: string): Promise<Promotion> {
        const deletedState = await this.PromotionModel
        .findByIdAndUpdate(
            id,
            { $set: { status: 'DELETED' } },
            { new: true }
        )
        .lean()
        .exec();
        return deletedState
    }

    /**
     * delete advertisement enquiry
     * @param id
     * @returns object
     */
    async deleteAdvertiseEnquiry(id: string): Promise<PromotionEnquiry> {
        const deletedState = await this.PromotionEnquiryModel
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