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
import { ClubService } from './club.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { SessionGuard } from '../session/session.guard';
import { AllowedRoles } from '../roles/roles.decorator';
import { Roles } from '../roles/roles.enum';
import { ClubEditInterceptor } from './interceptors/edit.interceptor';
import { EditClubDto } from './dto/edit.dto';
import { ClubViewModel, CheckInResponseViewModel, LogBookViewModel, LogBookCheckInsViewModel } from './vm';
import { CheckInDto, LogBookDto } from './dto';
import { Check, Message } from '../common/vm';
import { CheckIn } from './entities';
import * as content from '../content';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller(`${content.Routes.api}/club`)
@ApiTags('Club')
export class ClubController {

    constructor(
        private readonly clubService: ClubService,
    ) { }

    @UsePipes(new ValidationPipe({ transform: true }))
    @Get('list')
    async getAllClubs(): Promise<ClubViewModel[]> {
        return await this.clubService.getClubs();
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.YOUTHWORKER)
    @Get('check-in/:id')
    @ApiBearerAuth('youthWorker')
    async getGetClubCheckins(@Param('id') clubId: string): Promise<CheckIn[]> {
        return await this.clubService.getCheckinsForClub(clubId);
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @Post('check-in')
    async checkInJunior(@Body() userData: CheckInDto): Promise<CheckInResponseViewModel> {
        const alreadyCheckedIn = await this.clubService.checkIfAlreadyCheckedIn(userData.juniorId, userData.clubId);
        let check = null;
        if (alreadyCheckedIn) {
            check = new Check(false);
            return new CheckInResponseViewModel(check.result, 'Duplicate check-in');
        } else {
            check = new Check((await this.clubService.checkInJunior(userData)));
        }
        return new CheckInResponseViewModel(check.result);
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.YOUTHWORKER)
    @Post('check-ins')
    @ApiBearerAuth('youthWorker')
    async getYouthClubCheckIns(@Body() logBookData: LogBookDto): Promise<LogBookCheckInsViewModel> {
        return new LogBookCheckInsViewModel(
            (await this.clubService.getClubById(logBookData.clubId)).name,
            await this.clubService.getCheckins(logBookData));
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.ADMIN)
    @Get(':id')
    @ApiBearerAuth('admin')
    async getOneClub(@Param('id') id: string): Promise<ClubViewModel> {
        return new ClubViewModel(await this.clubService.getClubById(id));
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.ADMIN)
    @UseInterceptors(ClubEditInterceptor)
    @Post('edit')
    @ApiBearerAuth('admin')
    async edit(@Body() clubData: EditClubDto): Promise<Message> {
        return new Message(await this.clubService.editClub(clubData));
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.YOUTHWORKER)
    @Post('logbook')
    @ApiBearerAuth('youthWorker')
    async getLogBookData(@Body() logBookData: LogBookDto): Promise<LogBookViewModel> {
        return await this.clubService.generateLogBook(logBookData);
    }
}
