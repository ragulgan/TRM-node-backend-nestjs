import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class MillEnquiryDto {
    @ApiProperty({ example: 'GrainTech Solutions' })
    @IsString()
    companyName: string;

    @ApiProperty({ example: 'Mr.ram kumar' })
    @IsString()
    ownerName: string;

    @ApiProperty({ example: 'siddharth.abhimanyu@gmail.com' })
    @IsString()
    fromEmail: string;

    @ApiProperty({ example: 'siddharth.abhimanyu@gmail.com' })
    @IsString()
    toEmail: string;

    @ApiProperty({ example: '+91 9944266522' })
    @IsString()
    mobileNumber: string;

    @ApiProperty({ example: 'Ramanathapuram' })
    @IsString()
    district: string;

    @ApiProperty({ example: 'Rameswaram' })
    @IsString()
    city: string;

    @ApiProperty({ example: 'I am interested in your mill details, Can we talk if you have time.' })
    @IsString()
    message: string;

    @ApiProperty({ example: 'MILLER/SUPPLIER/SERVICE_PROVIDER' })
    @IsString()
    role: string;

    @ApiProperty({ example: '66ed4e2f55d5a721144bcb1d', description: 'miller Id' })
    millerId: string;
}