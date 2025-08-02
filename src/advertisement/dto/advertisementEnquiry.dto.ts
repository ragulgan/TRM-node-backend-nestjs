import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AdvertisementEnquiryDto {

  @ApiProperty({ example: 'GrainTech Solutions' })
  @IsString()
  companyName: string;

  @ApiProperty({ example: 'Mr.ram kumar' })
  @IsString()
  ownerName: string;

  @ApiProperty({ example: 'siddharth.abhimanyu@gmail.com' })
  @IsString()
  fromEmail: string;

  @ApiProperty({ example: 'siddharth.abhimanyu@gmail.com' })
  @IsString()
  toEmail: string;

  @ApiProperty({ example: '+91 9944266522' })
  @IsString()
  mobileNumber: string;

  @ApiProperty({ example: 'Ramanathapuram' })
  @IsString()
  district: string;

  @ApiProperty({ example: 'Rameswaram' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'I am interested in your product details, Can we talk if you have time.' })
  @IsString()
  message: string;

  @ApiProperty({ example: 'MILLER/SUPPLIER/SERVICE_PROVIDER/GUEST_USER' })
  @IsString()
  role: string;

  @ApiProperty({ example: 'Mr.Ram Kumar' })
  @IsString()
  productOwnername: string;

  @ApiProperty({ example: 'Rice Product' })
  @IsString()
  productName: string;

  @ApiProperty({ example: 'SUPPLIER/SERVICE_PROVIDER' })
  @IsString()
  productOwnerRole: string;

  @ApiProperty({ example: 'GrainTech Solutions' })
  @IsString()
  productOwnerCompanyName: string;
}