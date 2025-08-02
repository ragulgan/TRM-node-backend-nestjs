import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateContactUsDto {
    @ApiProperty({ example: 'READ/UNREAD' })
    @IsString()
    status: string;
}