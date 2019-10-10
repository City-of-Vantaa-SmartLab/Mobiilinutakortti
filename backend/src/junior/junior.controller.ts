import { Controller, UsePipes, ValidationPipe, Post, Body, UseGuards } from '@nestjs/common';
import { JuniorService } from './junior.service';
import { LoginJuniorDto, RegisterJuniorDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { Admin } from '../admin/admin.decorator';
import { AuthenticationService } from '../authentication/authentication.service';
import { AdminService } from '../admin/admin.service';

@Controller('junior')
export class JuniorController {

    // Todo remove admin dependancy once guards are in place.
    constructor(
        private readonly juniorService: JuniorService,
        private readonly authenticationService: AuthenticationService,
        private readonly adminService: AdminService,
    ) { }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'))
    @Post('register')
    async registerJunior(@Admin() payload: any, @Body() userData: RegisterJuniorDto) {
        await this.adminService.verifyIsAdmin(payload.user);
        return await this.juniorService.registerJunior(userData);
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @Post('login')
    async login(@Body() userData: LoginJuniorDto) {
        return await this.authenticationService.loginJunior(userData);
    }
}
