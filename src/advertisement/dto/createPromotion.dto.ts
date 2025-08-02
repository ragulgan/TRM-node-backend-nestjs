import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreatePromotioDto {

  @ApiProperty({ example: 'Rice Mill Machine 7.5 HP' })
  @IsString()
  readonly addTitle: string;

  @ApiProperty({ example: 'A 7.5 HP rice mill machine is a robust and versatile equipment capable of processing paddy into polished rice efficiently.' })
  @IsString()
  readonly description: string;

  @ApiProperty({ example: 'https://www.shutterstock.com/image-photo/part-time-jobs-announcement-business-260nw-2255670105.jpg' })
  @IsString()
  addImage: string;

  @ApiProperty({ example: 'https://www.shutterstock.com/video-url-example' })
  @IsString()
  videoUrl: string;

  @ApiPropertyOptional({ example: '663b6c3c6cc583f51d66bab1', description: 'Category ID associated with the ad' })
  @IsOptional()
  category: string;

  @ApiPropertyOptional({ example: '663b6c3c6cc583f51d66bab1', description: 'user ID associated with the ad' })
  @IsOptional()
  userId: string;

  @ApiProperty({ example: '66ed4e2f55d5a721144bcb1d', description: 'Role ID associated with the product' })
  @IsOptional()
  role: string;

  @ApiProperty({ example: '2024-11-25T10:04:08.461+00:00' })
  @IsOptional()
  startDate: string;

  @ApiProperty({ example: '2024-12-25T10:04:08.461+00:00' })
  @IsOptional()
  endDate: string;

  @ApiProperty({ example: 'ACTIVE' })
  readonly status: string;
}
