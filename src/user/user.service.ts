import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdatedUserDto } from './dto/updateUser.dto';
import { Otp } from '../otp/otp.schema';
import { LoginDto, OtpDto, SendSMSOTP, ResendOtpDto } from 'src/auth/dto/logindto';
import { SystemVariables } from 'src/systemVariables/systemVariables.schema';
import { removeNullNodes, smsOtpFactor, ResentOtpFactor } from '../utill/utill';
import axios from 'axios';
import * as csv from 'csv-parser';
import * as fs from 'fs';
import * as XLSX from 'xlsx';
const mongoose = require('mongoose');
import * as _ from 'lodash';
import * as moment from 'moment';
import { Role } from 'src/role/schema';
import { UpdatedUserProfileDto } from './dto/updateProfile.dto';
import { UserActivity } from './userActivities.schema';
import { AdminService } from '../adminUsers/admin.service';
import { MillEnquiryDto } from './dto/millEnquiry.dto';
import { EmailService } from '../emailService/emailService.service'
import { District } from '../district/district.schema';
import { ValidateOtp, ValidateOtpDocument } from './validateotp';
import { State } from '../state/state.schema';
import { City } from '../city/city.schema';
import { ResponseService } from '../base/controller';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private UserModel: Model<User>,
        @InjectModel(Otp.name) private OtpModel: Model<Otp>,
        @InjectModel(SystemVariables.name) private systemVariablesModel: Model<SystemVariables>,
        @InjectModel(Role.name) private roleModel: Model<Role>,
        @InjectModel(UserActivity.name) private userActivityModel: Model<UserActivity>,
        @InjectModel(District.name) private districtModel: Model<District>,
        @InjectModel(ValidateOtp.name) private validateOtpModel: Model<ValidateOtpDocument>,
        @InjectModel(State.name) private stateModel: Model<State>,
        @InjectModel(City.name) private cityModel: Model<City>,

        private readonly adminService: AdminService,
        private readonly emailService: EmailService,
        private readonly responseService: ResponseService,
    ) { }

    /**
     * Check exist user in user collection while create time (email,mobileNumber,companyName)
     * @param createUserDto
     * @returns object
     */
    async findUserForExistance(createUserDto: any) {
        try {
            let orConditions: any[] = [
                { email: new RegExp(`^${createUserDto.email?.trim()}$`, 'i') },
                { mobileNumber: new RegExp(`^${createUserDto.mobileNumber}$`, 'i') },
                { companyName: new RegExp(`^${createUserDto.companyName}$`, 'i') },
            ];

            const match = { $or: orConditions, status: { $ne: 'DELETED' } };
            return await this.UserModel.findOne(match).exec();
        } catch (err) {
            throw new Error('Error finding User');
        }
    }

    /**
     * Check exist user in user collection while update time (email, mobileNumber, companyName)
     * @param id
     * @param UpdatedUserDto
     * @returns object
     */
    async findUserForExistanceButId(id: string, UpdatedUserDto: UpdatedUserDto): Promise<User | null> {
        try {
            let orConditions: any[] = [];
            if (UpdatedUserDto.email?.trim()) {
                orConditions.push({ email: UpdatedUserDto.email });
            }

            if (UpdatedUserDto.mobileNumber?.trim()) {
                orConditions.push({ mobileNumber: UpdatedUserDto.mobileNumber });
            }

            if (UpdatedUserDto.companyName?.trim()) {
                orConditions.push({ companyName: UpdatedUserDto.companyName });
            }
            const match = {
                _id: { $ne: id },
                $or: orConditions,
            };

            return await this.UserModel.findOne(match).exec();

        } catch (err) {
            throw new Error('Error finding User');
        }
    }

    /**
     * Find existing user by id in profile update
     * @param id
     * @param UpdatedUserDto
     * @returns object
     */
    async findUserForExistanceButIdProfile(id: string, UpdatedUserDto: UpdatedUserProfileDto): Promise<User | null> {
        try {
            let orConditions: any[] = [{ email: UpdatedUserDto.email }, { mobileNumber: UpdatedUserDto.mobileNumber }]
            const match = { _id: { $ne: id }, $or: orConditions, status: { $ne: 'DELETED' } }
            return await this.UserModel.findOne(match).exec();
        } catch (err) {
            throw new Error('Error finding User');
        }
    }

    /**
     * Find by companyName
     * @param companyName
     * @returns object
     */
    async findByCompanyName(companyName: string): Promise<User | null> {
        return await this.UserModel.findOne({ companyName: companyName, status: { $ne: 'DELETED' } }).exec();
    }

    /**
     * Find by companyName using id
     * @param companyName
     * @param id
     * @returns object
     */
    async findByCompanyNameButId(companyName: string, id: string): Promise<User | null> {
        return await this.UserModel.findOne({ companyName: companyName, _id: { $ne: id }, status: { $ne: 'DELETED' } }).exec();
    }

    /**
     * Find user by email
     * @param email
     * @returns object
     */
    async findUserByEmail(email: string): Promise<User | null> {
        if (!email) return null;
        return await this.UserModel.findOne({ email });
    }

    /**
     * Create new user also create log entry in admin activity and user activity using (id and role)
     * @param createUserDto
     * @param id
     * @param role
     * @returns object
     */
    async create(createUserDto: CreateUserDto, id: string, role: string): Promise<User> {
        try {
            let districtSpecificCount = '';
            if (createUserDto.district) {
                const districtUserCount = await this.UserModel.countDocuments({
                    district: createUserDto.district,
                });
                const districtCount = `${(districtUserCount + 1).toString().padStart(3, '0')}`;
                const district = await this.districtModel.findById(createUserDto.district);
                if (!district) {
                    throw new Error('District not found');
                }
                districtSpecificCount = `${district.districtCode}${districtCount}`;
            }
            const userCount = await this.UserModel.countDocuments();
            const Number = userCount + 1;
            const registerNumber = `TRM${Number.toString().padStart(3, '0')}`;
            const data = {
                ...createUserDto,
                registerNumber,
                districtCount: districtSpecificCount || null,
            }

            const createdUser = await this.UserModel.create(data);
            if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
                try {
                    this.adminService.logAdminActivities({
                        adminId: id,
                        action: 'created_user',
                        activity: 'Created User',
                        userId: createdUser.id,
                        usefullIdFor: 'userid',
                        reason: `Created user: ${createdUser.ownerName}.`
                    }).then(() => { });
                } catch { }
            }
            try {
                this.logUserActivity({
                    userId: createdUser.id,
                    activity: 'Account Created',
                    action: 'account_created',
                    shortDescription: 'User account created.',
                }).then(() => { });
            } catch { }
            return createdUser;
        } catch (error) {
            console.log("Error:", error)
            throw new Error(`${error.message}`);
        }
    }
    // async create(createUserDto: CreateUserDto, id: string, role: string): Promise<User> {
    //     try {
    //       let districtSpecificCount = '';
    //       if (createUserDto.district) {
    //         const deletedUser = await this.UserModel.findOne({
    //           district: createUserDto.district,
    //           status: "DELETED"
    //         }).sort({ createdAt: 1 });
    //         if (deletedUser) {
    //           districtSpecificCount = deletedUser.districtCount;
    //           await this.UserModel.updateOne(
    //             { _id: deletedUser._id },
    //             { $set: { status: 'PROCESSED' } }
    //           );
    //         } else {
    //           const lastUser = await this.UserModel.findOne({
    //             district: createUserDto.district
    //           }).sort({ districtCount: -1 });
    //           let newCount = 1;
    //           if (lastUser && lastUser.districtCount) {
    //             const lastCount = parseInt(lastUser.districtCount.slice(-3));
    //             newCount = lastCount + 1;
    //           }
    //           const district = await this.districtModel.findById(createUserDto.district);
    //           if (!district) {
    //             throw new Error('District not found');
    //           }
    //           districtSpecificCount = `${district.districtCode}${newCount.toString().padStart(3, '0')}`;
    //         }
    //       }
    //       const userCount = await this.UserModel.countDocuments();
    //       const registerNumber = `TRM${(userCount + 1).toString().padStart(3, '0')}`;
    //       const data = {
    //         ...createUserDto,
    //         registerNumber,
    //         districtCount: districtSpecificCount || null,
    //       };
    //       const createdUser = await this.UserModel.create(data);
    //       if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
    //         try {
    //           this.adminService.logAdminActivities({
    //             adminId: id,
    //             action: 'created_user',
    //             activity: 'Created User',
    //             userId: createdUser.id,
    //             usefullIdFor: 'userid',
    //             reason: `Created user: ${createdUser.ownerName}.`
    //           }).then(() => { });
    //         } catch { }
    //       }
    //       // Log user activity
    //       try {
    //         this.logUserActivity({
    //           userId: createdUser.id,
    //           activity: 'Account Created',
    //           action: 'account_created',
    //           shortDescription: 'User account created.',
    //         }).then(() => { });
    //       } catch { }
    //       return createdUser;
    //     } catch (error) {
    //       console.log("Error:", error);
    //       throw new Error(`${error.message}`);
    //     }
    //   }

    /**
     * Get all user details in user collection
     * @param queryParams
     * @returns array of object
     */
    async findAll(queryParams: any) {
        const limit = Number(queryParams.limit) || 10
        const page = Number(queryParams.page) || 1
        const skipValue = (page - 1) * limit;
        let match: any = {
            $and: [
                { status: { $ne: 'DELETED' } },
                { mobileNumber: { $ne: "9047371199" } }
            ]
        }
        const ObjectId = mongoose.Types.ObjectId;

        if (queryParams.supplierName) {
            const supplierName = queryParams.supplierName.split(' ').filter(name => name.trim());

            const orCondition = [];

            // firstName search
            if (supplierName.length > 0) {
                orCondition.push({
                    fullName: new RegExp(supplierName[0], 'i')
                });
            }
            // lastName search
            // if (supplierName.length > 1) {
            //   orCondition.push({
            //     lastName: new RegExp(supplierName[1], 'i')
            //   });
            // } else {
            //   // search for it in both firstName and lastName
            //   orCondition.push({
            //     fullName: new RegExp(supplierName[0], 'i')
            //   });
            // }

            match = { ...match, $or: orCondition };
        }

        if (queryParams.fullName || queryParams.ownerName || queryParams.email || queryParams.mobileNumber || queryParams.companyEmail || queryParams.companyMobileNo || queryParams.whatappno) {
            const orCondition = []
            if (queryParams.fullName) {
                const splitValue = queryParams.fullName.split(' ');
                const filteredArr = splitValue.filter(entry => /\S/.test(entry));
                const fullName = filteredArr[0];
                if (fullName) {
                    orCondition.push({
                        fullName: new RegExp(`${fullName}`, 'i')
                    });
                }
            }

            if (queryParams.ownerName) {
                const splitValue = queryParams.ownerName.split(' ');
                const filteredArr = splitValue.filter(entry => /\S/.test(entry));
                const ownerName = filteredArr[filteredArr.length - 1];
                if (ownerName) {
                    orCondition.push({
                        ownerName: new RegExp(`${ownerName}`, 'i')
                    });
                }
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

            if (queryParams.companyEmail) {
                orCondition.push({
                    companyEmail: new RegExp(`${queryParams.companyEmail}`, 'i')
                });
            }

            if (queryParams.companyMobileNo) {
                orCondition.push({
                    companyMobileNo: new RegExp(`${queryParams.companyMobileNo}`, 'i')
                });
            }

            if (queryParams.whatappno) {
                orCondition.push({
                    whatappno: new RegExp(`${queryParams.whatappno}`, 'i')
                });
            }

            match = { ...match, $or: orCondition }
        }

        if (queryParams.status) {
            match.status = queryParams.status;
        }

        if (queryParams.contactPerson) {
            match.contactPersonName = new RegExp(queryParams.contactPerson, 'i')
        }

        if (queryParams.districtId) {
            if (_.isArray(queryParams.districtId)) {
                match['district'] = { $in: queryParams.districtId.map((id: string) => new ObjectId(id)) };
            } else {
                match['district'] = new ObjectId(queryParams.districtId);
            }
        }

        if (queryParams.cityId) {
            if (_.isArray(queryParams.cityId)) {
                match['city'] = { $in: queryParams.cityId.map((id: string) => new ObjectId(id)) };
            } else {
                match['city'] = new ObjectId(queryParams.cityId);
            }
        }

        if (queryParams.stateId) {
            if (_.isArray(queryParams.stateId)) {
                match['state'] = { $in: queryParams.stateId.map((id: string) => new ObjectId(id)) };
            } else {
                match['state'] = new ObjectId(queryParams.stateId);
            }
        }


        if (queryParams.categoryId) {
            if (_.isArray(queryParams.categoryId)) {
                match['categoryId'] = { $in: queryParams.categoryId.map((id: string) => new ObjectId(id)) };
            } else {
                match['categoryId'] = new ObjectId(queryParams.categoryId);
            }
        }

        if (queryParams.subcategoryId) {
            if (_.isArray(queryParams.subcategoryId)) {
                match['subcategoryId'] = { $in: queryParams.subcategoryId.map((id: string) => new ObjectId(id)) };
            } else {
                match['subcategoryId'] = new ObjectId(queryParams.subcategoryId);
            }
        }

        if (queryParams.companyName) {
            match.companyName = new RegExp(queryParams.companyName, 'i');
        }

        if (queryParams.productName) {
            match.productName = new RegExp(queryParams.productName, 'i');
        }

        // if (queryParams.isCommitteeMember !== undefined) {
        //   match.isCommitteeMember = queryParams.isCommitteeMember === 'true';
        // }

        if (queryParams.checkCommitee) {
            if (queryParams.checkCommitee === 'All') {
                match.isCommitteeMember = true;
            } else {
                match['position'] = new ObjectId(queryParams.checkCommitee);
            }
        }

        // if (queryParams.role) {
        //   match.role = new ObjectId(querParams.role)
        // }

        if (queryParams.role) {
            const role = await this.roleModel.findOne({ role: new RegExp(`${queryParams.role}`, 'i') }).exec();
            if (role) {
                match.role = role._id;
            } else {
                match.role = null;
            }
        }

        if (queryParams.manufacturer) {
            match.manufacturerId = new ObjectId(queryParams.manufacturer)
        }

        const UserList = await this.UserModel.find(match)
            .sort({ createdAt: -1 })
            .skip(skipValue)
            .limit(limit)
            .populate('role', 'id role')
            .populate('state', 'id stateName')
            .populate('district', 'id districtName')
            .populate('city', 'id cityName')
            .populate('position', 'id position')
            .populate('manufacturerId', 'id name displayName')
            .exec();

        const count = await this.UserModel.countDocuments(match).exec()
        return { UserList, count };
    }

    /**
     * Get all committee member based on display order ascending wise (old method not in use)
     * @param queryParams
     * @returns array of objects
     */
    // async findAllCommittee(queryParams: any) {
    //   const limit = Number(queryParams.limit) || 500
    //   const page = Number(queryParams.page) || 1
    //   const skipValue = (page - 1) * limit;
    //   let match: any = {
    //     $and: [
    //       { status: 'ACTIVE' },
    //       { isCommitteeMember: true }
    //     ]
    //   }
    //   if (queryParams.displayOrder) {
    //     match.displayOrder = queryParams.displayOrder
    //   }
    //   const CommitteeMemberList = await this.UserModel.find(match).select('ownerName profileImage description mobileNumber displayOrder').populate('position', 'id position').sort({ displayOrder: 1 }).skip(skipValue).limit(limit).exec();
    //   const count = await this.UserModel.countDocuments(match).exec()
    //   return { CommitteeMemberList, count };
    // }

    /**
     * Get all committee member based on high order display order standard
     * @param queryParams
     * @returns array of objects
     */
    async findAllCommittee(queryParams: any) {
        const limit = Number(queryParams.limit) || 500;
        const page = Number(queryParams.page) || 1;
        const skipValue = (page - 1) * limit;
        let match: any = {
            $and: [
                { status: 'ACTIVE' },
                { isCommitteeMember: true }
            ]
        };
        const CommitteeMemberList = await this.UserModel.find(match)
            .select('ownerName profileImage description mobileNumber')
            .populate('position', 'id position displayOrder')
            .skip(skipValue)
            .limit(limit)
            .exec();

        // sort the committee memberlist by displayorder
        CommitteeMemberList.sort((a, b) => {
            const displayOrderA = (a.position as any)?.displayOrder || NaN;
            const displayOrderB = (b.position as any)?.displayOrder || NaN;
            return displayOrderA - displayOrderB;
        });
        const count = await this.UserModel.countDocuments(match).exec();
        return { CommitteeMemberList, count };
    }

    /**
     * Find user by email
     * @param email
     * @returns object
     */
    async findByEmail(email: string): Promise<User | null> {
        const User = await this.UserModel.findOne({ email }).exec();
        return User || null;
    }

    /**
     * Find user by id also log the activity in admin and user collection
     * @param id
     * @param authId
     * @param authRole
     * @returns object
     */
    async findById(id: string, authId: string, authRole: string): Promise<User> {
        if (authRole === 'ADMIN' || authRole === 'SUPER_ADMIN') {
            try {
                this.adminService.logAdminActivities({
                    adminId: authId,
                    action: 'viewed_user',
                    activity: 'Viewed User',
                    userId: id,
                    usefullIdFor: 'userid',
                    reason: `Viewed user details`
                }).then(() => { });
            } catch { }
        }
        if (authRole === 'MILLER' || authRole === 'SUPPLIER' || authRole === 'SERVICE_PROVIDER') {
            try {
                this.logUserActivity({
                    userId: id,
                    activity: 'View account details.',
                    action: 'viewed_account',
                    shortDescription: 'Viewed account details.',
                }).then(() => { });
            } catch { }
        }
        return this.UserModel.findById(id)
            .populate('role', 'id role')
            .populate('state', 'id stateName')
            .populate('district', 'id districtName')
            .populate('city', 'id cityName')
            .populate('position', 'id position')
            .populate('manufacturerId', 'id name displayName').exec();
    }

    /**
     * Find user profile details by id
     * @param id
     * @returns object
     */
    async findUserProfileById(id: string) {
        const userDetails = await this.UserModel.findById(id)
            .select('ownerName mobileNumber email currentAddress profileImage companyName companyImage description website whatappno memberJoiningDate registerNumber districtCount postalCode')
            .populate('district', 'id districtName')
            .populate('state', 'id stateName')
            .populate('city', 'id cityName')
            .populate('categoryId', 'id categoryName')
            .populate('subcategoryId', 'id subCategoryName')
            .exec();
        return userDetails;
    }

    /**
     * Find activity by user id 
     * @param userId
     * @param queryParams
     * @returns array of objects
     */
    async findMyActivityById(userId: string, queryParams: { limit?: number; page?: number }) {
        const limit = queryParams.limit || 10;
        const page = queryParams.page || 1;
        const skipValue = (page - 1) * limit;
        try {
            const userActivities = await this.userActivityModel
                .find({ userId: userId })
                .populate("userId", "id ownerName")
                .sort({ createdAt: -1 })
                .skip(skipValue)
                .limit(limit)
                .exec();
            const count = await this.userActivityModel.countDocuments({ userId: userId });
            return { userActivities, count };
        } catch (error) {
            throw new Error(`Failed to find user activities: ${error.message}`);
        }
    }

    /**
     * Bulk upload
     * @param filePath
     * @param authRole
     * @param authId
     * @param roleId
     * @param stateId
     * @param districtId
     * @param cityId
     * @returns array of objects
     */
    async parseFile(filePath: string, authRole: any, authId: any, roleId: any, stateId: any, districtId: any, cityId: any) {
        const fileExtension = filePath.split('.').pop();
        let data: any[] = [];

        if (fileExtension === 'xlsx') {
            // Handle Excel files
            const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            data = XLSX.utils.sheet_to_json(worksheet);
        } else if (fileExtension === 'csv') {
            // Handle CSV files
            data = await new Promise<any[]>((resolve, reject) => {
                const results: any[] = [];
                fs.createReadStream(filePath)
                    .pipe(csv())
                    .on('data', (row) => results.push(row))
                    .on('end', () => resolve(results))
                    .on('error', (error) => reject(error));
            });
        }

        if (!data || data.length === 0) {
            return {
                status: 'error',
                code: '5014'
            }
        }

        let districtSpecificCount = '';
        if (districtId) {
            const districtUserCount = await this.UserModel.countDocuments({
                district: districtId,
            });
            const districtCount = `${(districtUserCount + 1).toString().padStart(3, '0')}`;
            const district = await this.districtModel.findById(districtId);
            if (!district) {
                throw new Error('District not found');
            }
            districtSpecificCount = `${district.districtCode}${districtCount}`;
        }
        const userCount = await this.UserModel.countDocuments();
        const Number = userCount + 1;
        const registerNumber = `TRM${Number.toString().padStart(3, '0')}`;

        let imported: number = 0;
        let rejected: number = 0;
        const usersToInserted: any = [];
        for (const result of data) {
            // const memberJoin  = new Date();
            // const formattedmemberJoiningDate = moment(memberJoin, 'DD-MM-YYYY').utc().toDate();
            const newUser = {
                ...result,
                // memberJoiningDate: formattedmemberJoiningDate,
                role: roleId ? roleId : null,
                state: stateId ? stateId : null,
                district: districtId ? districtId : null,
                city: cityId ? cityId : null,
                isExistUser: true,
                status: 'ACTIVE',
                registerNumber,
                districtCount: districtSpecificCount || null,
            };
            // usersToInsert.push(newUser);
            const existingUser = await this.findUserForExistance({ companyName: result.companyName, email: result.email, mobileNumber: result.mobileNumber });
            if (existingUser && existingUser.id) {
                usersToInserted.push({ user: newUser, message: "Company name or Email or Mobile number already present." });
                rejected += 1;
            } else {
                try {
                    await this.create(newUser, authId, authRole);
                    usersToInserted.push({ user: newUser, message: "Saved successfully!" });
                    imported += 1;
                } catch (e) {
                    usersToInserted.push({ user: newUser, message: e.message });
                    rejected += 1;
                }
            }
        }
        return {
            status: 'success',
            code: '5013',
            data: { usersToInserted, imported, rejected }
        }
    }

    /**
     * Find by role id
     * @param roleId
     * @returns object
     */
    async findRoleById(roleId: string) {
        return this.roleModel.findOne({ _id: roleId, status: 'ACTIVE' });
    }

    /**
     * Find state by id
     * @param stateId
     * @returns
     */
    async findStateById(stateId: string) {
        return this.stateModel.findOne({ _id: stateId, status: 'ACTIVE' });
    }

    /**
     * Find district by id
     * @param districtId
     * @returns
     */
    async findDistrictById(districtId: string) {
        return this.districtModel.findOne({ _id: districtId, status: 'ACTIVE' });
    }

    /**
     * Find city by id
     * @param cityId
     * @returns
     */
    async findCityById(cityId: string) {
        return this.cityModel.findOne({ _id: cityId, status: 'ACTIVE' });
    }

    /**
     * Update user by id also log the activity in user activity and admin activity
     * @param id
     * @param updatedUserDto
     * @param authId
     * @param authRole
     * @returns object
     */
    async update(id: string, updatedUserDto: UpdatedUserDto, authId: string, authRole: string): Promise<User> {
        try {
            if (updatedUserDto.district) {
                const district = await this.districtModel.findById(updatedUserDto.district);

                if (!district) {
                    throw new Error('District not found');
                }

                const districtUserCount = await this.UserModel.countDocuments({
                    district: updatedUserDto.district,
                });

                const districtCount = (districtUserCount + 1).toString().padStart(3, '0');
                updatedUserDto.districtCount = `${district.districtCode}${districtCount}`;
            } else {
                updatedUserDto.districtCount = null;
            }

            const updatedUser = await this.UserModel.findOneAndUpdate(
                { _id: id },
                updatedUserDto,
                { new: true }
            ).exec();
            if (authRole === 'ADMIN' || authRole === 'SUPER_ADMIN') {
                try {
                    await this.adminService.logAdminActivities({
                        adminId: authId,
                        action: 'updated_user',
                        activity: 'Updated user details.',
                        userId: id,
                        usefullIdFor: 'userid',
                        reason: `Updated ${updatedUserDto.ownerName} details.`,
                    });
                } catch (error) {
                    console.error('Error logging admin activities:', error);
                }
            }
            try {
                await this.logUserActivity({
                    userId: id,
                    activity: 'Updated user details by admin.',
                    action: 'updated_user',
                    shortDescription: 'Updated user details by admin.',
                });
            } catch (error) {
                console.error('Error logging user activities:', error);
            }

            return updatedUser;
        } catch (error) {
            console.error('Error updating user:', error);
            throw new Error('Error occurred while updating User.');
        }
    }
    // async update(id: string, updatedUserDto: UpdatedUserDto, authId: string, authRole: string): Promise<User> {
    //     try {
    //         const existingUser = await this.UserModel.findById(id);
    //         if (!existingUser) {
    //             throw new Error('User not found');
    //         }
    //         if (updatedUserDto.district && updatedUserDto.district !== existingUser.district) {
    //             const district = await this.districtModel.findById(updatedUserDto.district);
    //             if (!district) {
    //                 throw new Error('District not found');
    //             }
    //             const deletedUser = await this.UserModel.findOne({
    //                 district: updatedUserDto.district,
    //                 status: "DELETED"
    //             }).sort({ createdAt: 1 });
    //             if (deletedUser) {
    //                 updatedUserDto.districtCount = deletedUser.districtCount;
    //                 await this.UserModel.updateOne(
    //                     { _id: deletedUser._id },
    //                     { $set: { status: 'PROCESSED' } }
    //                 );
    //             } else {
    //                 const lastUser = await this.UserModel.findOne({
    //                     district: updatedUserDto.district
    //                 }).sort({ districtCount: -1 });
    //                 let newCount = 1;
    //                 if (lastUser && lastUser.districtCount) {
    //                     const lastCount = parseInt(lastUser.districtCount.slice(-3));
    //                     newCount = lastCount + 1;
    //                 }
    //                 updatedUserDto.districtCount = `${district.districtCode}${newCount.toString().padStart(3, '0')}`;
    //             }
    //         }
    //         const updatedUser = await this.UserModel.findOneAndUpdate(
    //             { _id: id },
    //             updatedUserDto,
    //             { new: true }
    //         ).exec();
    //         if (authRole === 'ADMIN' || authRole === 'SUPER_ADMIN') {
    //             try {
    //                 await this.adminService.logAdminActivities({
    //                     adminId: authId,
    //                     action: 'updated_user',
    //                     activity: 'Updated user details.',
    //                     userId: id,
    //                     usefullIdFor: 'userid',
    //                     reason: `Updated ${updatedUserDto.ownerName} details.`,
    //                 });
    //             } catch (error) {
    //                 console.error('Error logging admin activities:', error);
    //             }
    //         }
    //         try {
    //             await this.logUserActivity({
    //                 userId: id,
    //                 activity: 'Updated user details by admin.',
    //                 action: 'updated_user',
    //                 shortDescription: 'Updated user details by admin.',
    //             });
    //         } catch (error) {
    //             console.error('Error logging user activities:', error);
    //         }
    //         return updatedUser;
    //     } catch (error) {
    //         console.error('Error updating user:', error);
    //         throw new Error('Error occurred while updating User.');
    //     }
    // }

    /**
     * Update user profile
     * @param id
     * @param UpdateUserDto
     * @param authRole
     * @returns object
     */
    async updateUserModel(id: any, UpdateUserDto: UpdatedUserProfileDto, authRole: string): Promise<User | null> {
        const sanitizedData = removeNullNodes(UpdateUserDto);

        const finalDataToUpdate = { ...sanitizedData };

        if (UpdateUserDto.email) { // user updating email means profile completed
            finalDataToUpdate['isExistUser'] = true;
        }
        if (authRole === 'MILLER' || authRole === 'SUPPLIER' || authRole === 'SERVICE_PROVIDER') {
            try {
                this.logUserActivity({
                    userId: id,
                    activity: 'Updated profile details by user.',
                    action: 'updated_profile',
                    shortDescription: 'Updated profile details by user.',
                }).then(() => { });
            } catch { }
        }
        return await this.UserModel.findByIdAndUpdate(
            id,
            finalDataToUpdate,
            { new: true, runValidators: true }
        ).exec();
    }

    /**
     * Delete user also append before random number for unique check skip
     * @param id
     * @param auth
     * @returns object
     */
    async delete(id: string, auth: any): Promise<User> {
        const random = Math.floor(Math.random() * 100000000);
        const user = await this.UserModel.findById(id);
        const deletedUser = await this.UserModel
            .findByIdAndUpdate(
                id,
                { $set: { status: 'DELETED', mobileNumber: `deleted_${random}_${user.mobileNumber}`, email: `deleted_${random}_${user.email}`, companyName: `deleted_${random}_${user.companyName}` } },
                { new: true }
            )
            .lean()
            .exec();
        if (auth.role === 'ADMIN' || auth.role === 'SUPER_ADMIN') {
            try {
                this.adminService.logAdminActivities({
                    adminId: auth.id,
                    action: 'deleted_user by admin',
                    activity: 'Deleted User by admin',
                    userId: id,
                    usefullIdFor: 'userid',
                    reason: `delete user details by admin.`
                }).then(() => { });
            } catch { }
        }
        return deletedUser
    }

    /**
     * OTP send old method (Note: not use now)
     * @param mobileNumber
     * @param otp
     * @returns
     */
    async sentOTP(mobileNumber: string, otp: string) {
        const sender = 'TRM'; // Sender name
        const expireTime = await this.systemVariablesModel.findOne({ name: 'OTP_EXPIRE_TIME_MINS' });
        const expireIn = expireTime && expireTime.value ? expireTime.value : 10; // 10 default expire time in mins.
        // Message details
        const numbers = [mobileNumber]; // Array of recipient numbers
        const message = encodeURIComponent(`Login OTP for TRM is ${otp}. OTP will expire in ${expireIn} mins.`);
        const apiKey = encodeURI(process.env.SMS_API_TOKEN);
        const smsUrl = `${process.env.SMS_API_ENDPOINT}?apiKey=${apiKey}&sender=${sender}&message=${message}&numbers=${numbers.join(',')}`;
        // Send the POST request using Axios
        return await axios.post(smsUrl);
    }

    /**
     * Generate OTP old method (Note: not use now)
     * @param loginDto
     * @returns object
     */
    async generateUserOtp(loginDto: LoginDto) {
        const systemVariables = await this.systemVariablesModel.find({ status: 'ACTIVE' });
        let generatedOTP = ''; // OTP is static until msg service implementation
        let assignDefaultOtp: boolean = false;
        let smsResponse: any;
        // get user record
        const userData = await this.UserModel.findOne({ mobileNumber: loginDto.mobileNumber });
        if (userData && userData?.status === "INACTIVE") {
            return 'INACTIVE';
        }

        const defaultOtpNos = systemVariables.find((item) => item.name === "DEFAULT_OTP_MOB_NOS");

        const defaultNos = defaultOtpNos && defaultOtpNos.value ? defaultOtpNos.value.split(",") : [];

        const otpEnabled = systemVariables.find((item) => item.name === "SENT_OTP");

        if (defaultNos && defaultNos.length && defaultNos.includes(loginDto.mobileNumber)) {
            assignDefaultOtp = true;
        } else if (otpEnabled && otpEnabled.value === 'YES') {
            generatedOTP = String(Math.floor(1000 + Math.random() * 9000)); // PRODCHANGE
            const restult = await this.sentOTP(loginDto.mobileNumber, generatedOTP.toString());
            smsResponse = restult.data;
            if (smsResponse?.data?.status === 'failure') {
                return 'OTP_FAILED';
            }
        } else {
            assignDefaultOtp = true;
        }

        if (assignDefaultOtp) {
            const defaultOtp = systemVariables.find((item) => item.name === "DEFAULT_OTP");
            generatedOTP = defaultOtp.value;
        }

        await new this.OtpModel({
            mobileNumber: loginDto.mobileNumber,
            otp: generatedOTP.toString(),
            status: 'PENDING',
            smsResponse: smsResponse
        }).save();
        return 'SUCCESS';
        // have to implement sms service to send OTP below
    }

    /**
     * Validate user OTP old method (Note: not use now)
     * @param otpDto
     * @returns object
     */
    async validateUserOtp(otpDto: OtpDto) {
        if (!otpDto.mobileNumber) { // if mobile number not present
            console.log("Validate OTP: mobile number not found.");
            return false;
        }

        if (!otpDto.otp) {// if otp not present
            console.log("Validate OTP: otp not found.");
            return false;
        }

        const userData = await this.UserModel.findOne({ mobileNumber: otpDto.mobileNumber, status: { $ne: 'DELETED' } });
        if (userData && userData?.status === "INACTIVE") { // if user is inactive
            console.log("Validate OTP: user inactive:", userData.mobileNumber);
            return { status: 'INACTIVE' };
        }

        const otpData: any[] = await this.OtpModel.find({ mobileNumber: otpDto.mobileNumber, status: 'PENDING' }).limit(1).sort({ createdAt: -1 });
        if (!otpData.length) {// if mobile number not present in otp table
            console.log("Validate OTP: pending otp not found in table:", userData.mobileNumber);
            return false;
        }

        const expireTime = moment.utc(otpData[0]?.createdAt).add(10, 'minutes');
        const currentTime = moment.utc();

        if (currentTime.isAfter(expireTime)) { // otp expired
            console.log("Validate OTP: otp expired:", userData.mobileNumber);
            this.OtpModel.updateOne({ _id: otpData[0]._id }, { status: 'EXPIRED' }).then(() => { });
            return false;
        }

        if (otpData[0].otp !== otpDto.otp) { // if otp is invalid
            console.log("Validate OTP: invalid otp:", userData.mobileNumber);
            return false;
        }

        this.OtpModel.updateOne({ _id: otpData[0]._id }, { status: 'VERIFIED' }).then(() => { });

        if (userData && userData._id) { // user already exist for mobile number
            this.logUserActivity({
                userId: userData._id.toString(),
                activity: "User Logged In",
                action: "logged_in",
                shortDescription: 'user logged in',
            }).then(() => { });
            if (userData.email) { // user updating email means profile completed
                return await this.UserModel
                    .findOneAndUpdate({ _id: userData._id }, {
                        isExistUser: true,
                    }, { new: true })
                    .populate('role', 'id role')
                    .exec();
            }

            return await this.UserModel
                .findOneAndUpdate({ _id: userData._id }, { isExistUser: false }, { new: true })
                .populate('role', 'id role')
                .exec();
        }
    }

    /**
     * user inactive cron when member createdAt exist more than one year
     * @param params
     * @returns
     */
    // async memberInactiveCron() {
    //   try {
    //     const oneYearAgo = moment.utc().subtract(365, 'days').toDate();
    //     console.log(`Cron Job Started`);
    //     console.log(`Checking for records older than: ${oneYearAgo}`);
    //     const result = await this.UserModel.updateMany(
    //       {
    //         status: "ACTIVE",
    //         memberJoiningDate: { $lt: oneYearAgo }
    //       },
    //       {
    //         $set: { status: "INACTIVE" }
    //       }
    //     );
    //     console.log(`Cron Job Completed: Unit unlock expiry check`);
    //     console.log(`Total records matched: ${result.matchedCount}`);
    //     console.log(`Total records modified: ${result.modifiedCount}`);
    //   } catch (error) {
    //     console.error(`Error in checkMemberInactive cron job: ${error.message}`);
    //   }
    // }

    /**
     * user log activity common function
     * @param params
     * @returns object
     */
    async logUserActivity(params: Partial<UserActivity>) {
        const activity = new this.userActivityModel(params);
        return activity.save();
    }

    /**
     * Send enquiry email to miller
     * @param sendProductEnquiryDto
     */
    async sendProductRequest(sendProductEnquiryDto: MillEnquiryDto) {
        try {
            const templateData = {
                "name": sendProductEnquiryDto.ownerName,
                "message": sendProductEnquiryDto.message,
                "companyName": sendProductEnquiryDto.companyName,
                "email": sendProductEnquiryDto.fromEmail,
                "mobileNumber": sendProductEnquiryDto.mobileNumber,
                "district": sendProductEnquiryDto.district,
                "city": sendProductEnquiryDto.city
            }
            await this.emailService.sendMail(
                sendProductEnquiryDto.toEmail,
                "Enquiry about the mill details.",
                `${sendProductEnquiryDto.role}`,
                templateData
            ).then(() => { })
        } catch (error) {
            console.log("Error sending mill enquiry mail:", error);
            throw new Error("Error mail not sent.");
        }
    }

    /**
     * SMS OTP new method
     * @param sendsmsOTP 
     * @returns object
     */
    async smsOTP(sendsmsOTP: SendSMSOTP) {
        const systemVariables = await this.systemVariablesModel.find({ status: 'ACTIVE' });

        let generatedOTP = '';
        let assignDefaultOtp = false;
        let smsResponse: any;
        const defaultOtpNos = systemVariables.find((item) => item.name === 'DEFAULT_OTP_MOB_NOS');
        const defaultNos = defaultOtpNos && defaultOtpNos.value ? defaultOtpNos.value.split(',') : [];
        if (defaultNos && defaultNos.includes(sendsmsOTP.mobileNumber)) {
            assignDefaultOtp = true;
        }
        if (assignDefaultOtp) {
            const defaultOtp = systemVariables.find((item) => item.name === 'DEFAULT_OTP');
            generatedOTP = defaultOtp.value;
        } else {
            const userData = await this.UserModel.findOne({ mobileNumber: sendsmsOTP.mobileNumber, status: { $ne: 'DELETED' } });
            if (!userData) {
                return 'USER_NOT_FOUND';
            }

            if (userData.status === 'INACTIVE') {
                return 'INACTIVE';
            }
            await this.validateOtpModel.updateMany(
                { status: 'PENDING', createdAt: { $lt: new Date(Date.now()) } },
                { $set: { status: 'EXPIRED' } }
            );
            const existingOtp = await this.validateOtpModel.findOne({
                mobileNumber: sendsmsOTP.mobileNumber,
                status: 'PENDING'
            });

            if (existingOtp) {
                return 'OTP_PENDING';
            }

            const otpResponse = await smsOtpFactor(sendsmsOTP);
            if (otpResponse.responseCode === 200) {
                generatedOTP = otpResponse.details?.otp || otpResponse.message || 'Fallback OTP';
                smsResponse = otpResponse;

                const otpRecord = new this.validateOtpModel({
                    mobileNumber: sendsmsOTP.mobileNumber,
                    status: 'PENDING',
                    createdAt: new Date()
                });
                await otpRecord.save();
            } else {
                console.error('Failed to send dynamic OTP');
                return 'OTP_FAILED';
            }
        }
        // Save OTP record (both dynamic and static)
        await new this.OtpModel({
            mobileNumber: sendsmsOTP.mobileNumber,
            otp: generatedOTP,
            status: 'PENDING',
        }).save();

        console.log('OTP sent and saved successfully');
        return 'SUCCESS';
    }

    /**
     * Validate user OTP new method
     * @param validateOtp
     * @returns
     */
    async validateUserSMSOtp(validateOtp: ValidateOtp) {
        if (!validateOtp.mobileNumber) {
            console.log('[Validate OTP]: Mobile number not provided.');
            return false;
        }

        const user = await this.UserModel.findOne({
            mobileNumber: validateOtp.mobileNumber,
            status: { $ne: 'DELETED' },
        }).populate('role', 'role id');

        if (!user) {
            console.log(`[Validate OTP]: User not found for mobileNumber ${validateOtp.mobileNumber}`);
            return false;
        }

        if (user.status === 'INACTIVE') {
            console.log(`[Validate OTP]: User ${user.mobileNumber} is inactive.`);
            return user;
        }

        const otpRecords = await this.validateOtpModel
            .find({
                mobileNumber: validateOtp.mobileNumber,
                status: 'PENDING',
            })
            .sort({ createdAt: -1 })
            .limit(1);

        if (!otpRecords.length) {
            console.log(`[Validate OTP]: No pending OTP found for mobileNumber ${validateOtp.mobileNumber}`);
            return false;
        }

        const otpRecord = otpRecords[0] as ValidateOtpDocument;

        if (!otpRecord.createdAt || moment.utc().isAfter(moment.utc(otpRecord.createdAt).add(10, 'minutes'))) {
            console.log(`[Validate OTP]: OTP expired for mobileNumber ${validateOtp.mobileNumber}`);
            await this.validateOtpModel.updateOne({ _id: otpRecord._id }, { status: 'EXPIRED' });
            return false;
        }

        await this.validateOtpModel.updateOne(
            { _id: otpRecord._id },
            { status: 'VERIFIED' }
        );

        if (user && user._id) {
            this.logUserActivity({
                userId: user._id.toString(),
                activity: "User Logged In",
                action: "logged_in",
                shortDescription: 'user logged in',
            }).then(() => { });
            if (user.email) {
                return await this.UserModel
                    .findOneAndUpdate({ _id: user._id }, {
                        isExistUser: true,
                    }, { new: true })
                    .populate('role', 'id role')
                    .exec();
            }

            return await this.UserModel
                .findOneAndUpdate({ _id: user._id }, { isExistUser: false }, { new: true })
                .populate('role', 'id role')
                .exec();
        }
    }

    /**
     * Resend OTP
     * @param resendOtp
     * @returns object
     */
    async resentOtp(resendOtp: ResendOtpDto) {
        const userData = await this.UserModel.findOne({ mobileNumber: resendOtp.mobileNumber });

        if (!userData) {
            return 'USER_NOT_FOUND';
        }

        if (userData.status === 'INACTIVE') {
            return 'INACTIVE';
        }

        await this.validateOtpModel.updateMany(
            { status: 'PENDING', createdAt: { $lt: new Date(Date.now()) } },
            { $set: { status: 'EXPIRED' } },
        );
        const existingOtp = await this.validateOtpModel.findOne({
            mobileNumber: resendOtp.mobileNumber,
            status: 'PENDING',
        });

        if (existingOtp) {
            return 'OTP_PENDING';
        }

        try {
            const otpResponse = await ResentOtpFactor(resendOtp);

            if (otpResponse.responseCode === 200) {
                const otpRecord = new this.validateOtpModel({
                    mobileNumber: resendOtp.mobileNumber,
                    status: 'PENDING',
                    createdAt: new Date(),
                });
                await otpRecord.save();

                console.log('OTP resent successfully');
                return 'SUCCESS';
            } else {
                return 'OTP_FAILED';
            }
        } catch (error) {
            console.error('Error generating OTP:', error.message);
            return 'OTP_FAILED';
        }
    }

}