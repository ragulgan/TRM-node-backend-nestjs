import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdatedNewsAndEventsDto {

    @ApiProperty({ example: 'FormerDay' })
    @IsString()
    title: string;

    @ApiProperty({ example: 'https://www.shutterstock.com/image-photo/part-time-jobs-announcement-business-260nw-2255670105.jpg' })
    @IsString()
    titleImage: string;

    // @ApiProperty({ example: 'https://www.shutterstock.com/video-url-example' })
    // @IsString()
    // videoUrl: string;

    @ApiProperty({ example: 'Kisan Diwas also known as National Farmers Day is celebrated on 23rd December every year to mark the Birth Anniversary of the 5th Prime Minister of India, Shri. Choudhary Charan Singh. This day is observed to honor and pay tribute to the farmers, who are considered the nations backbone' })
    @IsString()
    description: string;

    @ApiProperty({ example: 'ACTIVE' })
    readonly status: string;
}