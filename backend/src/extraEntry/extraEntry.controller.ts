import {
    Controller,
    UsePipes,
    ValidationPipe,
    UseGuards,
    Post,
    Get,
    Body
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { SessionGuard } from '../session/session.guard';
import { AllowedRoles } from '../roles/roles.decorator';
import { Roles } from '../roles/roles.enum';
import * as content from '../content';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Message } from 'src/common/vm';
import { ExtraEntryService } from './extraEntry.service';
import { CreateExtraEntryTypeDto } from './dto/create.dto';

@Controller(`${content.Routes.api}/extraEntry`)
@ApiTags('ExtraEntry')
export class ExtraEntryController {

    constructor(
        private readonly extraEntryService: ExtraEntryService
    ) { }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.ADMIN)
    @Get('type/list')
    @ApiBearerAuth('admin')
    async getAllExtraTypes(): Promise<any> {
        return await this.extraEntryService.getAllExtraTypes();
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.ADMIN)
    @Post('type/create')
    @ApiBearerAuth('admin')
    async createExtraEntry(@Body() extraEntryTypeData: CreateExtraEntryTypeDto): Promise<Message>  {
        return new Message(await this.extraEntryService.createExtraEntry(extraEntryTypeData));
    };
}
