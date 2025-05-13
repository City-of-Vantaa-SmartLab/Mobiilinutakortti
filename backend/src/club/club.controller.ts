import {
    Controller,
    UsePipes,
    ValidationPipe,
    UseGuards,
    Get,
    Param,
    Post,
    Body,
    UseInterceptors
} from '@nestjs/common';
import { ClubService } from './club.service';
import { SpamGuardService } from '../spamGuard/spamGuard.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { SessionGuard } from '../session/session.guard';
import { AllowedRoles } from '../roles/roles.decorator';
import { Roles } from '../roles/roles.enum';
import { ClubEditInterceptor } from './interceptors/edit.interceptor';
import { EditClubDto } from './dto/edit.dto';
import { ClubViewModel, CheckInResponseViewModel, CheckInStatsViewModel, CheckInLogViewModel } from './vm';
import { CheckInDto, CheckInStatsSettingsDto } from './dto';
import { Message } from '../common/vm';
import { CheckIn } from './entities';
import * as content from '../content';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { failReason } from './vm/checkInResponse.vm';

@Controller(`${content.Routes.api}/club`)
@ApiTags('Club')
export class ClubController {

    constructor(
        private readonly clubService: ClubService,
        private readonly spamGuardService: SpamGuardService
    ) { }

    @UsePipes(new ValidationPipe({ transform: true }))
    @Get('list')
    async getAllClubs(): Promise<ClubViewModel[]> {
        return await this.clubService.getClubs();
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.YOUTHWORKER)
    @Get('checkIn/:id')
    @ApiBearerAuth('youthWorker')
    async getGetClubCheckins(@Param('id') clubId: number): Promise<CheckIn[]> {
        return await this.clubService.getCheckinsForClub(clubId);
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @Post('checkIn')
    async checkInJunior(@Body() userData: CheckInDto): Promise<CheckInResponseViewModel> {
        let canCheckIn = this.spamGuardService.checkSecurityCode(userData.clubId, userData.securityCode);
        if (!canCheckIn) return new CheckInResponseViewModel(false, failReason.CODE);

        canCheckIn &&= this.spamGuardService.checkIn(userData.juniorId, userData.clubId);
        if (canCheckIn) {
            canCheckIn &&= await this.clubService.checkInJunior(userData);
        } else {
            return new CheckInResponseViewModel(false, failReason.SPAM);
        }

        return new CheckInResponseViewModel(canCheckIn);
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.YOUTHWORKER)
    @Post('checkInLog')
    @ApiBearerAuth('youthWorker')
    async getYouthClubCheckIns(@Body() settings: CheckInStatsSettingsDto): Promise<CheckInLogViewModel> {
        return new CheckInLogViewModel(
            (await this.clubService.getClubById(settings.clubId)).name,
            await this.clubService.getCheckins(settings));
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.ADMIN)
    @Get(':id')
    @ApiBearerAuth('admin')
    async getOneClub(@Param('id') id: number): Promise<ClubViewModel> {
        return new ClubViewModel(await this.clubService.getClubById(id));
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.ADMIN)
    @UseInterceptors(ClubEditInterceptor)
    @Post('edit')
    @ApiBearerAuth('admin')
    async edit(@Body() clubData: EditClubDto): Promise<Message> {
        return new Message(await this.clubService.editClub(clubData));
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.YOUTHWORKER)
    @Post('checkInStats')
    @ApiBearerAuth('youthWorker')
    async getCheckInStatistics(@Body() settings: CheckInStatsSettingsDto): Promise<CheckInStatsViewModel> {
        return await this.clubService.generateStats(settings);
    }
}
