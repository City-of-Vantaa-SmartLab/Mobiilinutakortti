import { Controller, UsePipes, ValidationPipe, Post, Body, UseGuards, UseInterceptors, Get } from '@nestjs/common';
import { JuniorService } from './junior.service';
import { LoginJuniorDto, RegisterJuniorDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticationService } from '../authentication/authentication.service';
import { AllowedRoles } from '../roles/roles.decorator';
import { Roles } from '../roles/roles.enum';
import { RolesGuard } from '../roles/roles.guard';
import { EditJuniorDto } from './dto/edit.dto';
import { JuniorEditInterceptor } from './interceptors/edit.interceptor';
import { ResetJuniorDto } from './dto/reset.dto';

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
    async autoLogin() {
        // This is a simple route the frontend can hit to verify a valid JWT.
        return true;
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @Post('login')
    async login(@Body() userData: LoginJuniorDto) {
        return await this.authenticationService.loginJunior(userData);
    }

    @Post('reset')
    async resetLogin(@Body() userData: ResetJuniorDto) {
        return await this.juniorService.resetLogin(userData.phoneNumber);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @AllowedRoles(Roles.ADMIN)
    @UseInterceptors(JuniorEditInterceptor)
    @Post('edit')
    async edit(@Body() userData: EditJuniorDto) {
        return await this.juniorService.editJunior(userData);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @AllowedRoles(Roles.ADMIN)
    @Get('list')
    async getAllAdmins() {
        return await this.juniorService.listAllJuniors();
    }
}
