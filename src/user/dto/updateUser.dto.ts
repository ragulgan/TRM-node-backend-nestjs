import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsEmail } from 'class-validator';

export class UpdatedUserDto {
    @ApiProperty({ example: 'Sivaganga Rice Mill' })
    companyName: string;

    @ApiProperty({ example: 'Ajith' })
    @IsOptional()
    ownerName: string;

    @ApiPropertyOptional({ example: '645645-34535345-34534534.jpg' })
    @IsOptional()
    profileImage: string;

    @ApiPropertyOptional({ example: 'https://images.pexels.com/photos/1438081/pexels-photo-1438081.jpeg' })
    @IsOptional()
    companyImage: string;

    @ApiPropertyOptional({ example: 'delisa' })
    @IsOptional()
    contactPersonName: string;

    @ApiProperty({ example: 'admin@gmail.com' })
    @IsOptional()
    email: string;

    @ApiProperty({ example: '8825662022' })
    @IsPhoneNumber('IN', { message: 'Invalid mobile number' })
    readonly mobileNumber: string;

    @ApiProperty({ example: '8825662022' })
    whatappno: string;

    @ApiProperty({ example: '04526 25311' })
    companyTelephone: string;

    @ApiPropertyOptional({ example: '8825662021' })
    @IsOptional()
    alternativeMobileNumber: string;

    @ApiProperty({ example: 'https://mywebsite.com' })
    website: string;

    @ApiProperty({ example: '2024-11-25T10:04:08.461+00:00' })
    @IsOptional()
    memberJoiningDate: string;

    @ApiPropertyOptional({ example: false })
    @IsOptional()
    isCommitteeMember: boolean;

    @ApiPropertyOptional({ example: '66ed4e2f55d5a721144bcb1d', description: 'position id' })
    @IsOptional()
    position: string;

    @ApiPropertyOptional({ example: '66ed4e2f55d5a721144bcb1d', description: 'manufacturer id' })
    @IsOptional()
    manufacturerId: string;

    @ApiProperty({ example: '66ed4e2f55d5a721144bcb1d', description: 'Role ID associated with the product' })
    role: string;

    @ApiProperty({ example: '66ed4e2f55d5a721144bcb1d', description: 'state ID associated with the product' })
    state: string;

    @ApiProperty({ example: '66ed4e2f55d5a721144bcb1d', description: 'district ID associated with the product' })
    @IsOptional()
    district: string;

    @ApiProperty({ example: '66ed4e2f55d5a721144bcb1d', description: 'city ID associated with the product' })
    @IsOptional()
    city: string;

    @ApiProperty({ example: '123/Sample address.' })
    currentAddress: string;

    @ApiProperty({ example: '603002', description: 'Year of passing the education' })
    description: string;

    @ApiProperty({ example: 'ACTIVE' })
    @IsNotEmpty({ message: 'Status should not be empty, Status should be ACTIVE, INACTIVE' })
    status: string;

    @ApiProperty({ example: ['66337243078cdeef0c68ba70', '663372c197da03ab6d864053'] })
    @IsOptional()
    categoryId: string[];

    @ApiProperty({ example: ['66337243078cdeef0c68ba70', '663372c197da03ab6d864053'] })
    @IsOptional()
    subcategoryId: string[];


    @ApiProperty({ example: '560001' })
    @IsOptional()
    postalCode: string;

    districtCount: string
}