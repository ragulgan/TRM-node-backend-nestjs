import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class UpdatedUserProfileDto {
    @ApiProperty({ example: 'Ajith' })
    @IsOptional()
    ownerName: string;

    @ApiProperty({ example: 'admin@gmail.com' })
    @IsOptional()
    @IsEmail({}, { message: 'Invalid email format' })
    readonly email: string;

    @ApiProperty({ example: '8825662022' })
    @IsPhoneNumber('IN', { message: 'Invalid mobile number' })
    readonly mobileNumber: string;

    @ApiPropertyOptional({ example: '645645-34535345-34534534.jpg' })
    @IsOptional()
    profileImage: string;

    @ApiPropertyOptional({ example: 'https://images.pexels.com/photos/1438081/pexels-photo-1438081.jpeg' })
    @IsOptional()
    companyImage: string;

    @ApiProperty({ example: '66ed4e2f55d5a721144bcb1d', description: 'state ID associated with the product' })
    state: string;

    @ApiProperty({ example: '66ed4e2f55d5a721144bcb1d', description: 'district ID associated with the product' })
    district: string;

    @ApiProperty({ example: '66ed4e2f55d5a721144bcb1d', description: 'city ID associated with the product' })
    city: string;

    @ApiProperty({ example: '123/Sample address.' })
    currentAddress: string;

    @ApiProperty({ example: 'https://mywebsite.com' })
    website: string;

    @ApiProperty({ example: '8825662022' })
    whatappno: string;

    @ApiProperty({ example: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s" })
    description: string;

    @ApiPropertyOptional({ example: '66ed4e2f55d5a721144bcb1d', description: 'position id' })
    @IsOptional()
    position: string;

    @ApiProperty({ example: '560001' })
    postalCode: string;
}