import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, IsBoolean, IsDateString, IsMongoId } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductBySupplierDto {

    @ApiProperty({ example: 'Organic Honey', description: 'Name of the product' })
    @IsString()
    @IsNotEmpty()
    productName: string;

    @ApiPropertyOptional({ example: "29.99", description: 'Price of the product' })
    @IsOptional()
    productPrice: string;

    @ApiProperty({
        example: ['image1.jpg'],
        description: 'Array of image URLs',
        type: [String]
    })
    @IsArray()
    @IsOptional()
    productImage: string[];

    @ApiProperty({ example: '66ed4e2f55d5a721144bcb1d', description: 'role ID associated with the product' })
    role: string;

    @ApiProperty({ example: '663b6c3c6cc583f51d66bab1', description: 'Category ID associated with the product' })
    @IsString()
    @IsNotEmpty()
    category: string;

    @ApiProperty({ example: '663b6c3c6cc583f51d66bab1', description: 'SubCategory ID associated with the product' })
    @IsString()
    @IsNotEmpty()
    subCategory: string;

    @ApiProperty({ example: 'High-quality organic honey', description: 'Description of the product', required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: 'ACTIVE', description: 'Current status of the product', required: false })
    @IsString()
    @IsOptional()
    status?: string;
}