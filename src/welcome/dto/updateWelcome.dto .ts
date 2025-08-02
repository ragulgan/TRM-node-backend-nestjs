import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { BannerType, Status } from 'src/libs/constants';

export class UpdatedWelcomeDto {
    @ApiProperty({
        example: 'ஒன்றிணைவோம்!! வெற்றிபெறுவோம்!!',
        required: false,
    })
    readonly subtitle: string;

    @ApiProperty({
        example: 'Empowering Rice Milling for a Sustainable Future',
        required: true,
    })
    readonly title: string;

    @ApiProperty({
        example: 'https://images.pexels.com/photos/1438081/pexels-photo-1438081.jpeg',
        required: true,
    })
    readonly image: string;

    @ApiPropertyOptional({
        example: "உழுதுண்டு வாழ்வாரே வாழ்வார்மற் றெல்லாம் தொழுதுண்டு பின்செல் பவர்",
        required: false,
    })
    @IsOptional()
    readonly description: string;

    @ApiProperty({ example: "HOME/ABOUTUS/GALLERY/SENDENQUIRY/MILLER" })
    @IsEnum(BannerType, { message: "Banner type should be 'HOME/ABOUTUS/GALLERY/SENDENQUIRY/MILLER'" })
    bannerType: string;

    @ApiProperty({ example: "ACTIVE/INACTIVE" })
    @IsEnum(Status, { message: "Status should be 'ACTIVE/INACTIVE'" })
    status: string;

    @ApiProperty({
        example: 'குறள் 1034',
        required: false,
    })
    kuralNo: string;
}