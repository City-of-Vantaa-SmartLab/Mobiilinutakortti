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
import { EventEditInterceptor } from './edit.interceptor';
import { EditEventDto } from './edit.dto';
import { EventViewModel } from './event.vm';
import { CheckInResponseViewModel, CheckInLogViewModel, failReason } from '../checkIn/vm';
import { CheckInDto } from '../checkIn/checkIn.dto';
import { Message } from '../common/vm';
import { CheckIn } from '../checkIn/checkIn.entity';
import { CreateEventDto } from './create.dto';
import * as content from '../content';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { YouthWorker } from '../youthWorker/youthWorker.decorator';

@Controller(`${content.Routes.api}/event`)
@ApiTags('Event')
export class EventController {

    constructor(
        private readonly eventService: EventService,
        private readonly spamGuardService: SpamGuardService
    ) { }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.YOUTHWORKER)
    @Get('list')
    @ApiBearerAuth('youthWorker')
    async getEvents(): Promise<EventViewModel[]> {
        return await this.eventService.getEvents();
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.YOUTHWORKER)
    @Post('checkIn')
    @ApiBearerAuth('youthWorker')
    async checkInForEvent(@Body() userData: CheckInDto): Promise<CheckInResponseViewModel> {
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
    @Get('checkInLog/:id')
    @ApiBearerAuth('youthWorker')
    async getEventCheckIns(@Param('id') id: number): Promise<CheckInLogViewModel> {
        return new CheckInLogViewModel(
            (await this.eventService.getEventById(id)).name,
            await this.eventService.getCheckInsForEvent(id));
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.YOUTHWORKER)
    @Post('create')
    @ApiBearerAuth('youthWorker')
    async create(@YouthWorker() youthWorker: { userId: string }, @Body() eventData: CreateEventDto): Promise<EventViewModel> {
        const createdEvent = await this.eventService.createEvent(eventData, youthWorker.userId);
        return new EventViewModel(createdEvent);
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.YOUTHWORKER)
    @Get(':id')
    @ApiBearerAuth('youthWorker')
    async getOneEvent(@Param('id') id: number): Promise<EventViewModel> {
        return new EventViewModel(await this.eventService.getEventById(id));
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.YOUTHWORKER)
    @UseInterceptors(EventEditInterceptor)
    @Post('edit')
    @ApiBearerAuth('youthWorker')
    async edit(@YouthWorker() youthWorker: { userId: string }, @Body() EventData: EditEventDto): Promise<Message> {
        return new Message(await this.eventService.editEvent(EventData, youthWorker.userId));
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.YOUTHWORKER)
    @Post('delete')
    @ApiBearerAuth('youthWorker')
    async delete(@YouthWorker() youthWorker: { userId: string }, @Body() data: { id: number }): Promise<Message> {
        return new Message(await this.eventService.deleteEvent(data.id, youthWorker.userId));
    }
}
