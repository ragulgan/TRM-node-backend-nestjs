import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { extractTokenFromHeaders } from '../utill/utill';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import * as _ from 'lodash';

export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor() {
        super();
    }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const token = extractTokenFromHeaders(req.headers);
        if (!token) {
            throw new UnauthorizedException('Token not found');
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (_.isEmpty(decoded)) {
                throw new UnauthorizedException('Invalid token');
            }
            return true;
        } catch (err) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}

@Injectable()
export class SuperAdminGuard implements CanActivate {
    constructor(private reflector: Reflector) { }
    canActivate(context: ExecutionContext): boolean | Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const token = extractTokenFromHeaders(req.headers);
        if (!token) {
            throw new UnauthorizedException('Token not found');
        }
        try {
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
            const userRole = decoded.role
            return userRole === 'SUPER_ADMIN';
        } catch (err) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}

@Injectable()
export class AdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const token = extractTokenFromHeaders(req.headers);
        if (!token) {
            throw new UnauthorizedException('Token not found');
        }
        try {
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
            return decoded.role === 'ADMIN' || decoded.role === 'SUPER_ADMIN';
        } catch (err) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}

@Injectable()
export class MillerGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const token = extractTokenFromHeaders(req.headers);
        if (!token) {
            throw new UnauthorizedException('Token not found');
        }
        try {
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
            return decoded.role === 'MILLER';
        } catch (err) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}

@Injectable()
export class MillerAdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const token = extractTokenFromHeaders(req.headers);
        if (!token) {
            throw new UnauthorizedException('Token not found');
        }
        try {
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
            return decoded.role === 'MILLER' || decoded.role === 'ADMIN' || decoded.role === 'SUPER_ADMIN';
        } catch (err) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}

@Injectable()
export class SupplierAdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const token = extractTokenFromHeaders(req.headers);
        if (!token) {
            throw new UnauthorizedException('Token not found');
        }
        try {
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
            return decoded.role === 'SUPPLIER' || decoded.role === 'ADMIN' || decoded.role === 'SUPER_ADMIN';
        } catch (err) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}

@Injectable()
export class ServiceProviderAdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const token = extractTokenFromHeaders(req.headers);
        if (!token) {
            throw new UnauthorizedException('Token not found');
        }
        try {
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
            return decoded.role === 'SERVICE_PROVIDER' || decoded.role === 'ADMIN' || decoded.role === 'SUPER_ADMIN';
        } catch (err) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}

@Injectable()
export class ServiceProviderSupplierMiller implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const token = extractTokenFromHeaders(req.headers);
        if (!token) {
            throw new UnauthorizedException('Token not found');
        }
        try {
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
            return decoded.role === 'SERVICE_PROVIDER' || decoded.role === 'SUPPLIER' || decoded.role === 'MILLER';
        } catch (err) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}

@Injectable()
export class ServiceProviderSupplierMillerAdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const token = extractTokenFromHeaders(req.headers);
        if (!token) {
            throw new UnauthorizedException('Token not found');
        }
        try {
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
            return decoded.role === 'SERVICE_PROVIDER' || decoded.role === 'SUPPLIER' || decoded.role === 'MILLER' || decoded.role === 'ADMIN' || decoded.role === 'SUPER_ADMIN';
        } catch (err) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}

@Injectable()
export class SupplierServiceProviderAdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const token = extractTokenFromHeaders(req.headers);
        if (!token) {
            throw new UnauthorizedException('Token not found');
        }
        try {
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
            return decoded.role === 'SERVICE_PROVIDER' || decoded.role === 'SUPPLIER' || decoded.role === 'ADMIN' || decoded.role === 'SUPER_ADMIN';
        } catch (err) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}

@Injectable()
export class ServiceProviderSupplierGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const token = extractTokenFromHeaders(req.headers);
        if (!token) {
            throw new UnauthorizedException('Token not found');
        }
        try {
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
            return decoded.role === 'SERVICE_PROVIDER' || decoded.role === 'SUPPLIER';
        } catch (err) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}