import {
    Controller,
    UsePipes,
    ValidationPipe,
    UseGuards,
    Post,
    Body,
    BadRequestException
} from '@nestjs/common';
import { AllowedRoles } from '../roles/roles.decorator';
import { AnnouncementData } from './classes/announcementData';
import { AnnouncementService } from './announcement.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import * as content from '../content';
import { AuthGuard } from '@nestjs/passport';
import { Message } from 'src/common/vm';
import { Roles } from '../roles/roles.enum';
import { RolesGuard } from '../roles/roles.guard';
import { SessionGuard } from '../session/session.guard';
import { YouthWorker } from '../youthWorker/youthWorker.decorator';

@Controller(`${content.Routes.api}/announcement`)
@ApiTags('Announcement')
export class AnnouncementController {

    constructor(
        private readonly announcementService: AnnouncementService
    ) { }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.ADMIN)
    @Post('dryrun')
    @ApiBearerAuth('admin')
    async clubAnnouncementDryRun(@YouthWorker() admin: { userId: string }, @Body() announcementData: AnnouncementData): Promise<Message> {
        announcementData.dryRun = true;
        return this.serviceCall(announcementData, admin.userId);
    };

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.ADMIN)
    @Post('create')
    @ApiBearerAuth('admin')
    async clubAnnouncement(@YouthWorker() admin: { userId: string }, @Body() announcementData: AnnouncementData): Promise<Message> {
        return this.serviceCall(announcementData, admin.userId);
    };

    private async serviceCall(announcementData: AnnouncementData, userId: string): Promise<Message> {
        if (announcementData.msgType === 'email') {
            return new Message(await this.announcementService.clubAnnouncementEmail(announcementData, userId));
        } else if (announcementData.msgType === 'sms') {
            return new Message(await this.announcementService.clubAnnouncementSms(announcementData, userId));
        } else {
            throw new BadRequestException(content.MessageTypeNotFound);
        };
    }
}
