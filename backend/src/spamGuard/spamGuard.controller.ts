import {
    Controller, UsePipes, ValidationPipe, Post, UseGuards, Body
} from '@nestjs/common';
import { SpamGuardService } from './spamGuard.service';
import { AuthGuard } from '@nestjs/passport';
import { AllowedRoles } from '../roles/roles.decorator';
import { Roles } from '../roles/roles.enum';
import { RolesGuard } from '../roles/roles.guard';
import { SessionGuard } from '../session/session.guard';
import { YouthWorker } from '../youthWorker/youthWorker.decorator';
import { Message } from '../common/vm';
import * as content from '../content';
import { GetSecurityCodeDto } from './getSecurityCode.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller(`${content.Routes.api}/spamguard`)
@ApiTags('SpamGuard')
export class SpamGuardController {

    constructor(
        private readonly spamGuardService: SpamGuardService
    ) { }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.ADMIN)
    @Post('reset')
    @ApiBearerAuth('youthWorker')
    async reset(@YouthWorker() youthWorker: { userId: string }): Promise<Message> {
        const count = this.spamGuardService.reset(youthWorker.userId);
        return new Message(count.toString());
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.YOUTHWORKER)
    @Post('getSecurityCode')
    @ApiBearerAuth('youthWorker')
    async getSecurityCode(@Body() body: GetSecurityCodeDto): Promise<Message> {
        const code = this.spamGuardService.getSecurityCode(body.targetId, body.forEvent);
        return new Message(code);
    }
}
