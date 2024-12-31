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
import { Message } from '../common/vm';
import { ExtraEntryService } from './extraEntry.service';
import { CreateExtraEntryTypeDto } from './dto/createType.dto';
import { ExtraEntryListViewModel } from './vm/extraEntryList.vm';
import { ExtraEntryTypeViewModel } from './vm/extraEntryType.vm';
import { ListControlDto } from '../common/dto';
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
    async getAllExtraEntries(@Query('controls') query: any): Promise<ExtraEntryListViewModel> {
        const controls = query ? JSON.parse(query) as ListControlDto : undefined;
        return await this.extraEntryService.getAllExtraEntries(controls);
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.YOUTHWORKER)
    @Post('create')
    @ApiBearerAuth('youthWorker')
    async createExtraEntry(@YouthWorker() youthWorker: { userId: string }, @Body() createExtraEntryData: CreateExtraEntryDto): Promise<Message> {
        return new Message(await this.extraEntryService.createEntry(createExtraEntryData, youthWorker.userId));
    };

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.YOUTHWORKER)
    @Delete('delete/:extraEntryId')
    @ApiBearerAuth('youthWorker')
    async deleteExtraEntry(@YouthWorker() youthWorker: { userId: string }, @Param('extraEntryId') extraEntryId: number): Promise<Message>  {
        return new Message(await this.extraEntryService.deleteEntry(extraEntryId, youthWorker.userId));
    };

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.YOUTHWORKER)
    @Delete('deletepermit/:permitId')
    @ApiBearerAuth('youthWorker')
    async deletePermit(@YouthWorker() youthWorker: { userId: string }, @Param('permitId') permitId: number): Promise<Message>  {
        return new Message(await this.extraEntryService.deleteEntry(permitId, youthWorker.userId, true));
    };

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.YOUTHWORKER)
    @Get(':id')
    @ApiBearerAuth('youthWorker')
    async getExtraEntry(@Param('id') id: string): Promise<any> {
        return await this.extraEntryService.getExtraEntriesForJunior(id);
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
    async createExtraEntryType(@Body() extraEntryTypeData: CreateExtraEntryTypeDto): Promise<Message> {
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
