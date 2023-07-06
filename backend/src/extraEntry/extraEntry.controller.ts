import {
    Controller,
    UsePipes,
    ValidationPipe,
    UseGuards,
    Param,
    Post,
    Get,
    Body,
    Query
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
import { ExtraEntryListViewModel } from './vm/extraEntryList.vm';
import { ExtraEntryViewModel } from './vm/extraEntry.vm';
import { ExtraEntryTypeViewModel } from './vm/extraEntryType.vm';
import { ListControlDto } from 'src/common/dto';
import { YouthWorker } from '../youthWorker/youthWorker.decorator';

@Controller(`${content.Routes.api}/extraEntry`)
@ApiTags('ExtraEntry')
export class ExtraEntryController {

    constructor(
        private readonly extraEntryService: ExtraEntryService
    ) { }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.YOUTHWORKER)
    @Get('list')
    @ApiBearerAuth('youthWorker')
    async getAllExtraEntries(@YouthWorker() youthWorker: { userId: string }, @Query('controls') query): Promise<ExtraEntryListViewModel> {
        const controls = query ? JSON.parse(query) as ListControlDto : undefined;
        return await this.extraEntryService.getAllExtraEntries(controls, youthWorker.userId);
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.YOUTHWORKER)
    @Post('create')
    @ApiBearerAuth('youthWorker')
    async createExtraEntry(@YouthWorker() youthWorker: { userId: string }, @Body() extraEntryTypeData: CreateExtraEntryTypeDto): Promise<Message>  {
        return new Message(await this.extraEntryService.createExtraEntry(extraEntryTypeData, youthWorker.userId));
    };

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.YOUTHWORKER)
    @Get('type/list')
    @ApiBearerAuth('youthWorker')
    async getAllExtraEntryTypes(): Promise<ExtraEntryTypeViewModel[]> {
        return await this.extraEntryService.getAllExtraEntryTypes();
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.ADMIN)
    @Post('type/create')
    @ApiBearerAuth('admin')
    async createExtraEntryType(@Body() extraEntryTypeData: CreateExtraEntryTypeDto): Promise<Message>  {
        return new Message(await this.extraEntryService.createExtraEntry(extraEntryTypeData));
    };

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.YOUTHWORKER)
    @Get('type/:id')
    @ApiBearerAuth('youthWorker')
    async getExtraEntryType(@Param('id') id: any): Promise<ExtraEntryTypeViewModel> {
        return await this.extraEntryService.getExtraEntryType(id);
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.YOUTHWORKER)
    @Post(':id')
    @ApiBearerAuth('youthWorker')
    async getExtraEntriesForJunior(@Param('id') id: string): Promise<ExtraEntryViewModel>  {
        return new ExtraEntryViewModel(await this.extraEntryService.getExtraEntriesForJunior(id));
    };
}
