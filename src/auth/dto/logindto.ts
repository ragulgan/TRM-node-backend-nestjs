import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
    @ApiProperty({
        example: '8825662022',
        required: false
    })
    readonly mobileNumber: string;
}

export class OtpDto {
    @IsNotEmpty()
    @ApiProperty({
        example: '8825662022',
        required: false
    })
    readonly mobileNumber: string;

    @IsNotEmpty()
    @ApiProperty({
        example: '1234',
        required: false
    })
    readonly otp: string;
}

export class AdminDto {
    @IsNotEmpty()
    @ApiProperty({
        example: 'ajithkumar.shenll@gmail.com',
        required: false
    })
    readonly email: string;

    @IsNotEmpty()
    @ApiProperty({
        example: 'Test@123',
        required: false
    })
    readonly password: string;
}

export class CreateAdminDto {
    @IsNotEmpty()
    @ApiProperty({
        example: 'ajithkumar.shenll@gmail.com',
        required: true
    })
    readonly email: string;

    @IsNotEmpty()
    @ApiProperty({
        example: 'Test@123',
        required: true
    })
    readonly password: string;
}

export class SuperAdminChangePasswordDto {
    @IsNotEmpty()
    @ApiProperty({
        example: '662a033786eeaaaf4b7830f7',
        required: true
    })
    readonly adminId: string;

    @IsNotEmpty()
    @ApiProperty({
        example: 'ajith@123',
        required: true
    })
    readonly newPassword: string;
}

export class SendSMSOTP {
    @ApiProperty({
        example: '8825662022',
        required: false
    })
    readonly mobileNumber: string;
}

export class ResendOtpDto {
    @ApiProperty({ example: '9876543210', description: 'Mobile number of the user' })
    @IsString()
    @IsNotEmpty()
    mobileNumber: string;
}