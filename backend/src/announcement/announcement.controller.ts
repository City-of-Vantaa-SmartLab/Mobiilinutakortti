import {
    Controller,
    UsePipes,
    ValidationPipe,
    UseGuards,
    Post,
    Body,
    BadRequestException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { SessionGuard } from '../session/session.guard';
import { AllowedRoles } from '../roles/roles.decorator';
import { Roles } from '../roles/roles.enum';
import * as content from '../content';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AnnouncementData } from './classes/announcementData';
import { AnnouncementService } from './announcement.service';
import { Message } from 'src/common/vm';

@Controller(`${content.Routes.api}/announcement`)
@ApiTags('Announcement')
export class AnnouncementController {

    constructor(
        private readonly announcementService: AnnouncementService
    ) { }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.YOUTHWORKER)
    @Post('create')
    @ApiBearerAuth('youthWorker')
    async clubAnnouncement(@Body() announcementData: AnnouncementData): Promise<Message>  {
        const messageType = announcementData.msgType;
        if (messageType === 'email') {
            return  new Message(await this.announcementService.clubAnnouncementEmail(announcementData));
        } else if (messageType === 'sms') {
            return new Message(await this.announcementService.clubAnnouncementSms(announcementData));
        } else {
            throw new BadRequestException(content.MessageTypeNotFound);
        };
    };
}
