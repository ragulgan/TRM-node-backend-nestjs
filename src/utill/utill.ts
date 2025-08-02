import * as jwt from 'jsonwebtoken';
import { ERROR_CODES } from 'src/libs/constants';
import * as moment from 'moment'
import axios from 'axios';
import { SendSMSOTP, ResendOtpDto } from 'src/auth/dto/logindto';

export function extractTokenFromHeaders(headers: any): string | null {
    const authHeader = headers.authorization;
    if (!authHeader) {
        return null;
    }
    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
        return null;
    }
    return token;
}

export function verifyAndExtractToken(headers: any) {
    const authHeader = headers.authorization;
    if (!authHeader) {
        return null;
    }
    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
        return null;
    }
    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
        return decoded
    } catch (error) {
        console.error('JWT Verification Error:', error.message);
        return null;
    }
}

export function decodeJWTToken(headers: any) {
    const authHeader = headers.authorization;
    if (!authHeader) {
        return null;
    }
    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
        return null;
    }
    return jwt.decode(token);
}

export function decodeTokenForPayment(token: string) {
    if (!token) {
        return null;
    }
    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
        return decoded
    } catch (error) {
        console.error('JWT Verification Error:', error.message);
        return null;
    }
}

export const sanitizeUpdateData = (data: any) => {
    for (const key in data) {
        if (data[key] === "") {
            data[key] = null;
        }
    }
    return data;
};

export const removeNullNodes = (data: any) => {
    const result = {};
    for (const key in data) {
        if (data[key] !== null && data[key] !== undefined) {
            result[key] = data[key];
        }
    }
    return result;
}

export function getErrorCode(existing: any, createDto: any) {
    if (existing) {
        for (const [key, errorCode] of Object.entries(ERROR_CODES)) {
            if (existing[key] === createDto[key]) {
                return errorCode;
            }
        }
    }
    return null;
}


export const validateDOB = (dob: string) => {
    const userDOB = moment.utc(dob);
    const minDateDOB = moment.utc().subtract(16, 'years');
    return userDOB.isBefore(minDateDOB);
}

export const generateReferralCode = () => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i <= 16; i++) {//referral code length is 16
        const randomIndex = Math.floor(Math.random() * charset.length);
        code += charset[randomIndex];
    }
    return code;
}

/**
 * send SMS OTP third party api call
 * @param sendsmsOTP 
 * @returns object
 */
export async function smsOtpFactor(sendsmsOTP: SendSMSOTP) {
    const APIKEY = process.env.APIKEY;
    const FACTORBASEURL = process.env.FACTORBASEURL;
    const TEMPLATENAME = process.env.TEMPLATENAME;

    try {
        const formattedMobileNumber = `+91${sendsmsOTP.mobileNumber}`;
        // const requestUrl = `${FACTORBASEURL}/${APIKEY}/SMS/${formattedMobileNumber}/AUTOGEN3/${TEMPLATENAME}`;
        const requestUrl = `${FACTORBASEURL}/${APIKEY}/SMS/${formattedMobileNumber}/AUTOGEN3/OTPtemplate?var1=10`;

        const response = await axios.get(requestUrl);
        if (response.data.Status === 'Success') {
            console.log('OTP sent successfully:', response.data);
            return {
                responseCode: 200,
                message: 'OTP sent successfully',
                details: response.data.Details,
            };
        } else {
            console.error('Error sending OTP:', response.data.Details);
            return {
                responseCode: 400,
                message: response.data.Details,
            };
        }
    } catch (error) {
        console.error('Error in smsOtpFactor:', error.message);
        return {
            responseCode: 500,
            message: 'Internal server error while sending OTP',
        };
    }

}
/**
 * Validate OTP third party api call
 * @param mobileNumber 
 * @param code 
 * @returns object
 */
export async function validateOtpFactor(mobileNumber: string, code: string) {
    const APIKEY = process.env.APIKEY;
    const FACTORBASEURL = process.env.FACTORBASEURL;

    try {
        const requestUrl = `${FACTORBASEURL}/${APIKEY}/SMS/VERIFY3/${mobileNumber}/${code}`;
        const response = await axios.get(requestUrl);

        console.log('OTP Validation response:', response.data);
        return response;
    } catch (error) {
        console.error('Error in validateOTP:', error.message);
        throw new Error('Failed to validate OTP. Please try again later.');
    }
}

/**
 * Resend OTP third party api call
 * @param resentOtp
 * @returns object
 */
export async function ResentOtpFactor(resentOtp: ResendOtpDto) {
    const APIKEY = process.env.APIKEY;
    const FACTORBASEURL = process.env.FACTORBASEURL;
    const TEMPLATENAME = process.env.TEMPLATENAME;

    try {
        const formattedMobileNumber = `+91${resentOtp.mobileNumber}`;
        // const requestUrl = `${FACTORBASEURL}/${APIKEY}/SMS/${formattedMobileNumber}/AUTOGEN3/${TEMPLATENAME}`;
        const requestUrl = `${FACTORBASEURL}/${APIKEY}/SMS/${formattedMobileNumber}/AUTOGEN3/OTPtemplate?var1=10`;

        const response = await axios.get(requestUrl);
        if (response.data.Status === 'Success') {
            console.log('OTP has been resent successfully:', response.data);
            return {
                responseCode: 200,
                message: 'OTP has been resent successfully',
                details: response.data.Details,
            };
        } else {
            console.error('Error sending OTP:', response.data.Details);
            return {
                responseCode: 400,
                message: response.data.Details,
            };
        }
    } catch (error) {
        console.error('Error in smsOtpFactor:', error.message);
        return {
            responseCode: 500,
            message: 'Internal server error while sending OTP',
        };
    }
}