import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdatedPositionDto {
    @ApiProperty({ example: 'Vice-President' })
    @IsString()
    position: string;

    @ApiProperty({ example: 'ACTIVE' })
    status: string;
}