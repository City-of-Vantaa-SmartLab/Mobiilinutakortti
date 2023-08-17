import {
    Controller,
    UsePipes,
    ValidationPipe,
    UseGuards,
    Param,
    Post,
    Delete,
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
import { CreateExtraEntryTypeDto } from './dto/createType.dto';
import { ExtraEntryListViewModel } from './vm/extraEntryList.vm';
import { ExtraEntryTypeViewModel } from './vm/extraEntryType.vm';
import { ListControlDto } from 'src/common/dto';
import { YouthWorker } from '../youthWorker/youthWorker.decorator';
import { CreateExtraEntryDto } from './dto/create.dto';

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
    async createExtraEntry(@YouthWorker() youthWorker: { userId: string }, @Body() createExtraEntryData: CreateExtraEntryDto): Promise<Message>  {
        return new Message(await this.extraEntryService.createExtraEntry(createExtraEntryData, youthWorker.userId));
    };

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.YOUTHWORKER)
    @Delete('delete/:juniorId/:extraEntryId')
    @ApiBearerAuth('youthWorker')
    async deleteExtraEntry(@YouthWorker() youthWorker: { userId: string }, @Param('juniorId') juniorId: string, @Param('extraEntryId') extraEntryId: number): Promise<Message>  {
        return new Message(await this.extraEntryService.deleteExtraEntry(juniorId, extraEntryId, youthWorker.userId));
    };

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.YOUTHWORKER)
    @Get(':id')
    @ApiBearerAuth('youthWorker')
    async getExtraEntry(@YouthWorker() youthWorker: { userId: string }, @Param('id') id: string): Promise<any> {
        return await this.extraEntryService.getExtraEntriesForJunior(id, youthWorker.userId);
    }

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
        return new Message(await this.extraEntryService.createExtraEntryType(extraEntryTypeData));
    };

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.YOUTHWORKER)
    @Get('type/:id')
    @ApiBearerAuth('youthWorker')
    async getExtraEntryType(@Param('id') id: number): Promise<ExtraEntryTypeViewModel> {
        return await this.extraEntryService.getExtraEntryType(id);
    }
}
