import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdatedStateDto {
    @ApiProperty({ example: 'TamilNadu' })
    @IsString()
    readonly stateName: string;

    @ApiProperty({ example: 'ACTIVE' })
    readonly status: string;
}