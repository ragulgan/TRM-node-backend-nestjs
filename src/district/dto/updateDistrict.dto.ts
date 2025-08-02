import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdatedDistrictDto {
    @ApiProperty({ example: '663b5d30a8b23b5f0b848681' })
    @IsString()
    readonly stateId: string;

    @ApiProperty({ example: 'TamilNadu' })
    @IsString()
    readonly districtName: string;

    @ApiProperty({ example: 'VDU' })
    readonly districtCode: string;

    @ApiProperty({ example: 'ACTIVE' })
    readonly status: string;
}