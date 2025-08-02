import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Status } from 'src/libs/constants';

export class CreateManufacturerDto {
    @ApiProperty({ example: "MANUFACTURER/SALESPERSON" })
    name: string;

    @ApiProperty({ example: "ACTIVE/INACTIVE" })
    @IsEnum(Status, { message: "Status should be 'ACTIVE/INACTIVE'" })
    status: string;

    @ApiProperty()
    displayName: string;
}