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
import { EventService } from './event.service';
import { SpamGuardService } from '../spamGuard/spamGuard.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { SessionGuard } from '../session/session.guard';
import { AllowedRoles } from '../roles/roles.decorator';
import { Roles } from '../roles/roles.enum';
import { EditEventDto } from './edit.dto';
import { EventViewModel } from './event.vm';
import { CheckInResponseViewModel, CheckInStatsViewModel, CheckInLogViewModel, failReason } from '../checkIn/vm';
import { CheckInDto } from '../checkIn/checkIn.dto';
import { CheckInStatsSettingsDto } from '../checkIn/checkInStatsSettings.dto';
import { Message } from '../common/vm';
import { CheckIn } from '../checkIn/checkIn.entity';
import * as content from '../content';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller(`${content.Routes.api}/event`)
@ApiTags('Event')
export class EventController {

    constructor(
        private readonly eventService: EventService,
        private readonly spamGuardService: SpamGuardService
    ) { }

    @UsePipes(new ValidationPipe({ transform: true }))
    @Get('list')
    async getAllEvents(): Promise<EventViewModel[]> {
        return await this.eventService.getEvents();
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @Post('checkIn')
    async checkInJunior(@Body() userData: CheckInDto): Promise<CheckInResponseViewModel> {
        let canCheckIn = this.spamGuardService.checkSecurityCode(userData.targetId, userData.securityCode);
        if (!canCheckIn) return new CheckInResponseViewModel(false, failReason.CODE);

        canCheckIn &&= this.spamGuardService.checkIn(userData.juniorId, userData.targetId);
        if (canCheckIn) {
            canCheckIn &&= await this.eventService.checkInJunior(userData);
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
    async getEventCheckIns(@Body() settings: CheckInStatsSettingsDto): Promise<CheckInLogViewModel> {
        return new CheckInLogViewModel(
            (await this.eventService.getEventById(settings.targetId)).name,
            await this.eventService.getCheckIns(settings.targetId));
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.ADMIN)
    @Get(':id')
    @ApiBearerAuth('admin')
    async getOneEvent(@Param('id') id: number): Promise<EventViewModel> {
        return new EventViewModel(await this.eventService.getEventById(id));
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.ADMIN)
    //@UseInterceptors(EventEditInterceptor)
    @Post('edit')
    @ApiBearerAuth('admin')
    async edit(@Body() EventData: EditEventDto): Promise<Message> {
        return new Message(await this.eventService.editEvent(EventData));
    }
}
