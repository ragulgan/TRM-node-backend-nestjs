export const appConst = {
    HEADER: {
        CONTENT_TYPE: 'application/json'
    },
    ERROR: {
        CLIENT_ERROR: {
            SUCCESS_REQUEST: 200,
            SUCCESS_SAVED: 201,
            BAD_REQUEST: 400,
            UNAUTHORIZED: 401,
            ALREADY_EXIST: 409,
            SESSION_EXPIRED: 440
        },
        SERVER_ERROR: {
            INTERNAL_SERVER_ERROR: 500
        },
        CODE: 500,
        MSG: 'error'
    },
    SUCCESS: {
        CODE: 200,
        MSG: 'ok'
    },
    ALLOWED_MIME_TYPE: ['image/jpeg', 'image/png', 'image/jpg', 'image/JPEG', 'image/PNG', 'image/JPG', 'image/bmp', 'image/BMP', 'image/gif', 'image/GIF', 'image/apng', 'image/APNG', 'image/webp', 'image/WEBP', 'image/svg+xml'],
    VIDEO_MIME_TYPE: ['video/mp4', 'video/MP4', 'video/mov', 'video/MOV', 'video/avi', 'video/AVI', 'video/wmv', 'video/WMV', 'application/pdf', 'application/PDF'],
    AUDIO_MIME_TYPE: ['audio/wave', 'audio/mp3', 'audio/mpeg', 'audio/wav'],
};

export const VALIDATE_USER = {
    ADMIN: 'ADMIN',
    SUPER_ADMIN: 'SUPER_ADMIN',
    MILLER: 'MILLER',
    SUPPLIER: 'SUPPLIER',
    SERVICE_PROVIDER: 'SERVICE_PROVIDER'
}

export const PASSWORDVALID = {
    "incorrect": '2000',
    "user not found": '2002',
    "Interviewer is not found": '2003',
}

export const ERROR_CODES = {
    mobileNumber: '4222',
    email: '4226',
    staffId: '4223',
    studentId: '1150',
    name: '4224',
    keyName: '4225'
};

export const Dashboard_Filter = {
    YEARLY: 'YEARLY',
    MONTHLY: 'MONTHLY',
    WEEKLY: 'WEEKLY'
}

export enum NotificationStatus {
    READ = 'READ',
    UNREAD = 'UNREAD',
};

export enum BannerType {
    HOME = 'HOME',
    ABOUTUS = 'ABOUTUS',
    GALLERY = 'GALLERY',
    SENDENQUIRY = 'SENDENQUIRY',
    MILLER = 'MILLER'
}

export enum Status {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}

export enum ManufacturerEnum {
    MANUFACTURER = 'MANUFACTURER',
    SALESPERSON = 'SALESPERSON'
}