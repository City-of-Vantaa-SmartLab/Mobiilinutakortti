import {
    Controller,
    UsePipes,
    ValidationPipe,
    UseGuards,
    Post,
    Body,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { SessionGuard } from '../session/session.guard';
import { AllowedRoles } from '../roles/roles.decorator';
import { Roles } from '../roles/roles.enum';
import * as content from '../content';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InfoMessageData } from './classes/infoMessageData';
import { InfoService } from './info.service';

@Controller(`${content.Routes.api}/info`)
@ApiTags('Info')
export class InfoController {

    constructor(
        private readonly infoService: InfoService,
    ) { }
    
    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.YOUTHWORKER)
    @Post('sendmessage')
    @ApiBearerAuth('youthWorker')
    async sendMessageToClub(@Body() messageData: InfoMessageData) {
        return await this.infoService.sendMessageToClub(messageData);
    }
}
