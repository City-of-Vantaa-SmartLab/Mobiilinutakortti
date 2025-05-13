import {
    Controller, UsePipes, ValidationPipe, Post, UseGuards
} from '@nestjs/common';
import { KompassiService } from './kompassi.service';
import { AuthGuard } from '@nestjs/passport';
import { AllowedRoles } from '../roles/roles.decorator';
import { Roles } from '../roles/roles.enum';
import { RolesGuard } from '../roles/roles.guard';
import { SessionGuard } from '../session/session.guard';
import { YouthWorker } from '../youthWorker/youthWorker.decorator';
import * as content from '../content';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Check } from '../common/vm';

@Controller(`${content.Routes.api}/kompassi`)
@ApiTags('Kompassi')
export class KompassiController {
    constructor(
        private readonly kompassiService: KompassiService
    ) { }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.ADMIN)
    @Post('reset')
    @ApiBearerAuth('youthWorker')
    async reset(@YouthWorker() youthWorker: { userId: string }): Promise<Check> {
        this.kompassiService.reset(youthWorker.userId);
        return new Check(true);
    }
}
