import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Role } from './schema';
import { CreateRoleDto } from './dto/create.dto';
import { UpdateRoleDto } from './dto/update.dto';

@Injectable()
export class RoleService {
    constructor(@InjectModel(Role.name) private RoleModel: Model<Role>) { }

    /**
     * Create new role in admin login
     * @param createRoleDto
     * @returns object
     */
    async create(createRoleDto: CreateRoleDto): Promise<Role> {
        try {
            const createdState = new this.RoleModel(createRoleDto);
            const data = await createdState.save();
            return data
        } catch (error) {
            console.error("Validation Error:", error);
            throw new Error(`${error.message}`);
        }
    }

    /**
     * Get all role list details
     * @param queryParams
     * @returns array of objects
     */
    async findAll(queryParams) {
        const limit = Number(queryParams.limit)
        const page = Number(queryParams.page)
        const skipValue = Number(page - 1) * limit
        let match: any = { status: 'ACTIVE' }

        if (queryParams.role) {
            const orCondition = []
            orCondition.push({
                role: new RegExp(`${queryParams.role}`, 'i')
            }, {
                displayName: new RegExp(`${queryParams.role}`, 'i')
            });
            match = { ...match, $or: orCondition }
        }

        if (queryParams.status) {
            match.status = queryParams.status;
        }

        const roleList = await this.RoleModel.find(match).sort({ createdAt: -1 }).skip(skipValue).limit(limit).exec();
        const count = await this.RoleModel.countDocuments(match).exec()
        return { roleList, count };
    }

    /**
     * Find role by id
     * @param id
     * @returns object
     */
    async findById(id: string): Promise<Role> {
        return this.RoleModel.findById(id).exec();
    }

    /**
     * Find role by name
     * @param role
     * @returns object
     */
    async findByRole(role: string): Promise<Role | null> {
        return await this.RoleModel.findOne({ role: role, status: { $ne: 'DELETED' } }).exec();
    }

    /**
     * Find role by display name
     * @param displayName
     * @returns object
     */
    async findByDisplayName(displayName: string): Promise<Role | null> {
        return await this.RoleModel.findOne({ displayName: displayName, status: { $ne: 'DELETED' } }).exec();
    }

    /**
     * Find role by name using id
     * @param role
     * @param id
     * @returns object
     */
    async findByRoleButId(role: string, id: string): Promise<Role | null> {
        return await this.RoleModel.findOne({ role: role, _id: { $ne: id }, status: { $ne: 'DELETED' } }).exec();
    }

    /**
     * Find role by display name using id
     * @param displayName
     * @param id
     * @returns object
     */
    async findByDisplayNameButId(displayName: string, id: string): Promise<Role | null> {
        return await this.RoleModel.findOne({ displayName: displayName, _id: { $ne: id }, status: { $ne: 'DELETED' } }).exec();
    }

    /**
     * Update role by id
     * @param id
     * @param updateRoleDto
     * @returns object
     */
    async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
        return this.RoleModel.findOneAndUpdate({ _id: id }, updateRoleDto).exec();
    }

    /**
     * Delete role by id
     * @param id
     * @returns object
     */
    async delete(id: string): Promise<Role> {
        const deleteSite = await this.RoleModel
            .findByIdAndUpdate(
                id,
                { $set: { status: 'DELETED' } },
                { new: true }
            ).lean()
            .exec();
        return deleteSite;
    }

}