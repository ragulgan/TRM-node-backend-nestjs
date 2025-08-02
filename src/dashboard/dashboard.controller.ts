import { Controller, Get, Res, BadRequestException, UseGuards, Query, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ResponseService } from '../base/controller';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { appConst } from '../libs/constants';
import { AdminGuard } from 'src/auth/jwt-auth.guard';
const { ERROR, SUCCESS } = appConst;
import * as _ from 'lodash';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
    constructor(
        private readonly dashboardService: DashboardService,
        private readonly responseService: ResponseService,
    ) { }

    @UseGuards(AdminGuard)
    @ApiBearerAuth()
    @Get()
    async getUsersStatistics(@Res() res: Response, @Query() queryParams: null) {
        try {
            const userData = await this.dashboardService.getUserStatistics(queryParams);
            if (userData) {
                this.responseService.sendResponse({}, res, SUCCESS.CODE, {
                    code: '1004',
                    data: userData
                }, '1004');
            } else {
                this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1003' }, '1003');
            }
        } catch (e) {
            throw new BadRequestException();
        }
    }

}