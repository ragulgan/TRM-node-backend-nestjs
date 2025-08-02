import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdatedAboutUsDto {
    @ApiProperty({ example: 'Making your vision come true at the basics.' })
    @IsString()
    title: string;

    @ApiProperty({ example: 'https://www.shutterstock.com/image-photo/part-time-jobs-announcement-business-260nw-2255670105.jpg' })
    @IsString()
    Image: string;

    @ApiProperty({ example: 'Welcome to the Rice Mills Association, a collective organization dedicated to empowering rice mill owners and stakeholders across Tamil Nadu. Our association serves as a unified platform to promote excellence, innovation, and sustainability within the rice milling industry.' })
    @IsString()
    discription: string;

    @ApiProperty({ example: 'ACTIVE' })
    readonly status: string;

}