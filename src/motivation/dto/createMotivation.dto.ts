import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateMotivationDto {

    @ApiProperty({ example: 'Enhancing industry standards' })
    @IsString()
    title: string;

    @ApiProperty({ example: 'https://www.shutterstock.com/image-photo/part-time-jobs-announcement-business-260nw-2255670105.jpg' })
    @IsString()
    titleImage: string;

    @ApiProperty({ example: 'We aim to set and maintain the highest quality and safety standards in rice milling to ensure premium output and sustainable practices.' })
    @IsString()
    message: string;

    @ApiProperty({ example: 'ACTIVE' })
    status: string;
}