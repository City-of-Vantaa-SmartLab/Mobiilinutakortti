import { Controller, UsePipes, ValidationPipe, Post, Body, UseGuards, UseInterceptors, Get, Param, Delete } from '@nestjs/common';
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
import { Message, Check } from '../common/vm';
import { Challenge } from './entities';

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
    async registerJunior(@Body() userData: RegisterJuniorDto): Promise<Challenge> {
        return await this.juniorService.registerJunior(userData);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @AllowedRoles(Roles.JUNIOR)
    @Get('login')
    async autoLogin(): Promise<Check> {
        // This is a simple route the frontend can hit to verify a valid JWT.
        return new Check(true);
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @Post('login')
    async login(@Body() userData: LoginJuniorDto): Promise<JWTToken> {
        return await this.authenticationService.loginJunior(userData);
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @Post('reset')
    async resetLogin(@Body() userData: ResetJuniorDto): Promise<Challenge> {
        return await this.juniorService.resetLogin(userData.phoneNumber);
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @AllowedRoles(Roles.ADMIN)
    @UseInterceptors(JuniorEditInterceptor)
    @Post('edit')
    async edit(@Body() userData: EditJuniorDto): Promise<Message> {
        return new Message(await this.juniorService.editJunior(userData));
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
     * Deletes the junior account associated to the id provided.
     * @param id - the id of the junior to delete
     */
    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @AllowedRoles(Roles.ADMIN)
    @Delete(':id')
    async deleteJunior(@Param('id') id: string) {
        await this.juniorService.deleteJunior(id);
    }

}
