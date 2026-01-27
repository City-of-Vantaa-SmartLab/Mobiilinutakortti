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
import { ClubViewModel } from './vm';
import { CheckInResponseViewModel, CheckInStatsViewModel, CheckInLogViewModel, failReason } from '../checkIn/vm';
import { CheckInDto } from '../checkIn/checkIn.dto';
import { CheckInQueryDto } from '../checkIn/checkInQuery.dto';
import { Message } from '../common/vm';
import { CheckIn } from '../checkIn/checkIn.entity';
import * as content from '../content';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

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
        return await this.clubService.getCheckInsForClub(clubId);
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @Post('checkIn')
    async checkInJunior(@Body() checkInData: CheckInDto): Promise<CheckInResponseViewModel> {
        if (!this.spamGuardService.checkSecurityCode(checkInData.targetId, checkInData.securityCode)) {
            return new CheckInResponseViewModel(false, failReason.CODE);
        }

        if (!this.spamGuardService.checkIn(checkInData.juniorId, checkInData.targetId)) {
            return new CheckInResponseViewModel(false, failReason.SPAM);
        }

        const checkInSuccess = await this.clubService.checkInJunior(checkInData);
        return new CheckInResponseViewModel(checkInSuccess);
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.YOUTHWORKER)
    @Post('checkInLog')
    @ApiBearerAuth('youthWorker')
    async getYouthClubCheckIns(@Body() settings: CheckInQueryDto): Promise<CheckInLogViewModel> {
        return new CheckInLogViewModel(
            (await this.clubService.getClubById(settings.targetId)).name,
            await this.clubService.getCheckIns(settings));
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
    async getCheckInStatistics(@Body() settings: CheckInQueryDto): Promise<CheckInStatsViewModel> {
        return await this.clubService.generateStats(settings);
    }
}
