import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateGalleryDto {

    @ApiProperty({ example: 'Tech Giants Announce Collaboration for Climate Change Solutions' })
    @IsString()
    title: string;

    @ApiProperty({
        example: ['https://www.shutterstock.com/image-photo/part-time-jobs-announcement-business-260nw-2255670105.jpg'],
        description: 'Array of image URLs',
        type: [String]
    })
    @IsArray()
    titleImage: string[];

    @ApiProperty({ example: 'ACTIVE' })
    readonly status: string;

    @ApiProperty({ example: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book." })
    description: string;

    @ApiProperty({ example: '2024-11-25T10:04:08.461+00:00' })
    eventDate: Date;

    @ApiPropertyOptional()
    @IsOptional()
    eventTime: string;

    @ApiProperty()
    location: string;
}