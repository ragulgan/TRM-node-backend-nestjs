import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateAdvertiseEnquiryDto {
  @ApiProperty({ example: 'UNRESOLVE/SOLVED/DELETED' })
  @IsString()
  status: string;
}