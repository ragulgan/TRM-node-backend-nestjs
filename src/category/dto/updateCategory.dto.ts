import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdatedCategoryDto {
    @ApiProperty({ example: 'TamilNadu' })
    @IsString()
    readonly categoryName: string;

    @ApiProperty({ example: 'ACTIVE' })
    readonly status: string;
}