import { Controller, UsePipes, ValidationPipe, Post, Body, UseGuards, UseInterceptors, Get } from '@nestjs/common';
import { JuniorService } from './junior.service';
import { LoginJuniorDto, RegisterJuniorDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { Admin } from '../admin/admin.decorator';
import { AuthenticationService } from '../authentication/authentication.service';
import { AdminService } from '../admin/admin.service';
import { AllowedRoles } from '../roles/roles.decorator';
import { Roles } from '../roles/roles.enum';
import { RolesGuard } from '../roles/roles.guard';
import { EditJuniorDto } from './dto/edit.dto';
import { JuniorEditInterceptor } from './interceptors/edit.interceptor';

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
    async registerJunior(@Admin() payload: any, @Body() userData: RegisterJuniorDto) {
        return await this.juniorService.registerJunior(userData);
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @Post('login')
    async login(@Body() userData: LoginJuniorDto) {
        return await this.authenticationService.loginJunior(userData);
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
