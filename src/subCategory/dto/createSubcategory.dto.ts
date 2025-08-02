import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateSubCategoryDto {

    @ApiProperty({ example: '663b5d30a8b23b5f0b848681' })
    @IsString()
    readonly categoryId: string;

    @ApiProperty({ example: 'TamilNadu' })
    @IsString()
    readonly subCategoryName: string;

    @ApiProperty({ example: 'ACTIVE' })
    readonly status: string;
}