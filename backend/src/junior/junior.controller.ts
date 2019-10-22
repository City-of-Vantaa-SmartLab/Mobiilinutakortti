import { Controller, UsePipes, ValidationPipe, Post, Body, UseGuards, UseInterceptors, Get, Param, BadRequestException } from '@nestjs/common';
import { JuniorService } from './junior.service';
import { LoginJuniorDto, RegisterJuniorDto, EditJuniorDto, ResetJuniorDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticationService } from '../authentication/authentication.service';
import { AllowedRoles } from '../roles/roles.decorator';
import { Roles } from '../roles/roles.enum';
import { RolesGuard } from '../roles/roles.guard';
import { JuniorEditInterceptor } from './interceptors/edit.interceptor';
import { JuniorUserViewModel } from './vm/junior.vm';
import { JWTToken } from '../authentication/jwt.model';
import { Challenge } from './entities';
import { ConfigHelper } from '../configHandler';
import * as content from '../content.json';

@Controller('junior')
export class JuniorController {

    constructor(
        private readonly juniorService: JuniorService,
        private readonly authenticationService: AuthenticationService,
    ) { }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @AllowedRoles(Roles.ADMIN)
    @Post('register')
    async registerJunior(@Body() userData: RegisterJuniorDto) {
        return await this.juniorService.registerJunior(userData);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @AllowedRoles(Roles.JUNIOR)
    @Get('login')
    async autoLogin(): Promise<boolean> {
        // This is a simple route the frontend can hit to verify a valid JWT.
        return true;
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @Post('login')
    async login(@Body() userData: LoginJuniorDto): Promise<JWTToken> {
        return await this.authenticationService.loginJunior(userData);
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @Post('reset')
    async resetLogin(@Body() userData: ResetJuniorDto) {
        return await this.juniorService.resetLogin(userData.phoneNumber);
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @AllowedRoles(Roles.ADMIN)
    @UseInterceptors(JuniorEditInterceptor)
    @Post('edit')
    async edit(@Body() userData: EditJuniorDto): Promise<string> {
        return await this.juniorService.editJunior(userData);
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @AllowedRoles(Roles.ADMIN)
    @Get('list')
    async getAllJuniors(): Promise<JuniorUserViewModel[]> {
        return await this.juniorService.listAllJuniors();
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @AllowedRoles(Roles.ADMIN)
    @Get(':id')
    async getOneJunior(@Param('id') id: string): Promise<JuniorUserViewModel> {
        return new JuniorUserViewModel(await this.juniorService.getJunior(id));
    }

    /**
     * This is non prod route, only to be used in development.
     * @param phoneNumber phoneNumber to check.
     */
    @UsePipes(new ValidationPipe({ transform: true }))
    @Get('getChallenge/:phoneNumber')
    async getChallengeByPhoneNumber(@Param('phoneNumber') phoneNumber: string): Promise<Challenge> {
        if (ConfigHelper.isLive()) { throw new BadRequestException(content.NonProdFeature); }
        return await this.juniorService.getChallengeByPhoneNumber(phoneNumber);
    }

}
