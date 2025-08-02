import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from 'mongoose';
import { ContactUs } from "./contactus.schema";
import { ContactUsDto } from "./dto/contactus.dto";
import { MailerService } from "@nestjs-modules/mailer";
import { UpdateContactUsDto } from "./dto/contactusUpdate.dto";
import { Role } from '../role/schema';

@Injectable()
export class ContactUsService {
    constructor(
        @InjectModel(ContactUs.name) private contactUsModel: Model<ContactUs>,
        @InjectModel(Role.name) private roleModel: Model<Role>,
        private readonly mailService: MailerService
    ) { }

    /**
     * Contact us request send and create contact us
     * @param contactUsDto
     * @returns object
     */
    async saveContactRequest(contactUsDto: ContactUsDto) {
        contactUsDto.status = 'UNREAD';
        await this.mailService.sendMail({
            from: `${contactUsDto.email}`,
            to: process.env.SMTP_USERNAME,
            subject: `Request received from ${contactUsDto.name}`,
            text: `Message: ${contactUsDto.message}
      by
      ${contactUsDto.name}
      ${contactUsDto.email}
      ${contactUsDto.mobileNumber}`,
        }).then((res) => {
            console.log("Contact received mail sent:", res?.messageId);
        }).catch((e) => {
            console.log("Error:", e);
        })
        return this.contactUsModel.create(contactUsDto);
    }

    /**
     * Get all contact us list
     * @param queryParams
     * @returns array of object
     */
    async findAll(queryParams: any) {
        const limit = Number(queryParams.limit)
        const page = Number(queryParams.page)
        const skipValue = Number(page - 1) * limit
        let match: any = { enquiryStatus: { $ne: 'DELETED' } }

        if (queryParams.name || queryParams.email || queryParams.mobileNumber) {
            const orCondition = []
            if (queryParams.name) {
                orCondition.push({
                    name: new RegExp(`${queryParams.name}`, 'i')
                });
            }

            if (queryParams.email) {
                orCondition.push({
                    email: new RegExp(`${queryParams.email}`, 'i')
                });
            }

            if (queryParams.mobileNumber) {
                orCondition.push({
                    mobileNumber: new RegExp(`${queryParams.mobileNumber}`, 'i')
                });
            }

            match = { ...match, $or: orCondition }
        }

        if (queryParams.status) {
            match.status = queryParams.status;
        }

        if (queryParams.enquiryStatus) {
            match.enquiryStatus = queryParams.enquiryStatus;
        }

        if (queryParams.createdAt) {
            match.createdAt = queryParams.createdAt;
        }

        if (queryParams.role) {
            const role = await this.roleModel.findOne({ role: new RegExp(`${queryParams.role}`, 'i') }).exec();
            if (role) {
                match.role = role._id;
            } else {
                match.role = null;
            }
        }

        const messages = await this.contactUsModel.find(match).sort({ createdAt: -1 }).skip(skipValue).limit(limit).populate('role', 'id role displayName').exec();
        const count = await this.contactUsModel.countDocuments(match).exec()
        return { messages, count };
    }

    /**
     * Get contact us by id
     * @param id
     * @returns object
     */
    async findById(id: string): Promise<ContactUs> {
        return this.contactUsModel.findById(id).populate('role', 'id role displayName').exec();
    }

    /**
     * Update the contact us status only
     * @param id
     * @param updatedContactUsDto
     * @returns object
     */
    async update(id: string, updatedContactUsDto: UpdateContactUsDto): Promise<ContactUs> {
        const updateData = {
            status: updatedContactUsDto.status,
        };
        return this.contactUsModel.findOneAndUpdate({ _id: id }, updateData, { new: true }).exec();
    }

    /**
     * Delete contact us details by id
     * @param id
     * @returns object
     */
    async delete(id: string): Promise<ContactUs> {
        const deleteContactUs = await this.contactUsModel
            .findOneAndUpdate(
                { _id: id },
                { $set: { enquiryStatus: 'DELETED' } },
                { new: true }
            )
            .exec();
        return deleteContactUs
    }
}