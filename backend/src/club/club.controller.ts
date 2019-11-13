import { Controller, UsePipes, ValidationPipe, UseGuards, Get, Param, Post, Body } from '@nestjs/common';
import { ClubService } from './club.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { AllowedRoles } from '../roles/roles.decorator';
import { Roles } from '../roles/roles.enum';
import { ClubViewModel, CheckInResponseViewModel, LogBookViewModel, LogBookCheckInsViewModel } from './vm';
import { CheckInDto, LogBookDto } from './dto';
import { Check } from '../common/vm';
import { CheckIn } from './entities';
import { ClubGateway } from './club.gateway';
import { Socket } from 'socket.io';
import * as gatewayEvents from './gateway-events.json';
import * as content from '../content.json';

@Controller('club')
export class ClubController {

    constructor(
        private readonly clubService: ClubService,
        private readonly clubGateway: ClubGateway,
    ) { }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @AllowedRoles(Roles.ADMIN)
    @Get('list')
    async getAllClubs(): Promise<ClubViewModel[]> {
        return await this.clubService.getClubs();
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @AllowedRoles(Roles.ADMIN)
    @Get('check-in/:id')
    async getGetClubCheckins(@Param('id') clubId: string): Promise<CheckIn[]> {
        return await this.clubService.getCheckinsForClub(clubId);
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @AllowedRoles(Roles.ADMIN)
    @Post('check-in')
    async checkInJunior(@Body() userData: CheckInDto): Promise<Check> {
        const check = new Check((await this.clubService.checkInJunior(userData)));
        const socket = this.clubGateway.connectedJuniors[userData.juniorId] as Socket;
        if (socket) {
            const response = check.result ? (await this.clubService.getClubById(userData.clubId)).name : content.CheckInFailed;
            socket.emit(gatewayEvents.checkIn, new CheckInResponseViewModel(check.result, response));
        }
        return check;
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @AllowedRoles(Roles.ADMIN)
    @Post('check-ins')
    async getYouthClubCheckIns(@Body() logBookData: LogBookDto): Promise<LogBookCheckInsViewModel> {
        return new LogBookCheckInsViewModel(await this.clubService.getCheckinsForClubForDate(logBookData));
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @AllowedRoles(Roles.ADMIN)
    @Post('logbook')
    async getLogBookData(@Body() logBookData: LogBookDto): Promise<LogBookViewModel> {
        return await this.clubService.generateLogBook(logBookData);
    }
}
