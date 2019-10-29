import { Controller, UsePipes, ValidationPipe, UseGuards, Get, Param, Post, Body } from '@nestjs/common';
import { ClubService } from './club.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { AllowedRoles } from '../roles/roles.decorator';
import { Roles } from '../roles/roles.enum';
import { ClubViewModel } from './vm';
import { CheckInDto } from './dto';
import { Check } from '../common/vm';
import { CheckIn } from './entities';

@Controller('club')
export class ClubController {

    constructor(
        private readonly clubService: ClubService,
    ) { }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @AllowedRoles(Roles.ADMIN)
    @Get('list')
    async getAllClubs(): Promise<ClubViewModel[]> {
        return await this.clubService.getClubs();
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @AllowedRoles(Roles.ADMIN)
    @Get('check-in/:id')
    async getGetClubCheckins(@Param('id') clubId: string): Promise<CheckIn[]> {
        return await this.clubService.getCheckinsForClub(clubId);
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @AllowedRoles(Roles.ADMIN)
    @Post('check-in')
    async checkInJunior(@Body() userData: CheckInDto): Promise<Check> {
        return new Check((await this.clubService.checkInJunior(userData)));
    }
}
