import {
    Controller, UsePipes, ValidationPipe, Post, Body, UseGuards, UseInterceptors,
    Get, Param, BadRequestException, Delete, Query, Res,
} from '@nestjs/common';
import { JuniorService } from './junior.service';
import { LoginJuniorDto, RegisterJuniorDto, EditJuniorDto, ResetJuniorDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticationService } from '../authentication/authentication.service';
import { AllowedRoles } from '../roles/roles.decorator';
import { Roles } from '../roles/roles.enum';
import { RolesGuard } from '../roles/roles.guard';
import { JuniorEditInterceptor } from './interceptors/edit.interceptor';
import { JuniorUserViewModel, JuniorQRViewModel } from './vm';
import { JWTToken } from '../authentication/jwt.model';
import { Junior } from './junior.decorator';
import { Message, Check, TotalViewModel } from '../common/vm';
import { Challenge } from './entities';
// Note, do not delete these imports, they are not currently in use but are used in the commented out code to be used later in prod.
// The same note is made for the earlier imported BadRequestException
import { ConfigHelper } from '../configHandler';
import * as content from '../content.json';
import { ListControlDto } from '../common/dto';
import { PhoneNumberValidationPipe } from './pipes/phoneNumberValidation.pipe';
import { ResetPhoneNumberValidationPipe } from './pipes/resetPhoneNumberValidation.pipe';

@Controller(`${content.Routes.api}/junior`)
export class JuniorController {

    constructor(
        private readonly juniorService: JuniorService,
        private readonly authenticationService: AuthenticationService,
    ) { }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @AllowedRoles(Roles.ADMIN)
    @Post('register')
    async registerJunior(@Body(PhoneNumberValidationPipe) userData: RegisterJuniorDto): Promise<Message> {
        return new Message(await this.juniorService.registerJunior(userData));
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @AllowedRoles(Roles.JUNIOR)
    @Get('getSelf')
    async getSelf(@Junior() juniorData: any): Promise<JuniorQRViewModel> {
        return new JuniorQRViewModel(await this.juniorService.getJunior(juniorData.userId));
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
    async resetLogin(@Body(ResetPhoneNumberValidationPipe) userData: ResetJuniorDto): Promise<Message> {
        return new Message(await this.juniorService.resetLogin(userData.phoneNumber));
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @AllowedRoles(Roles.ADMIN)
    @UseInterceptors(JuniorEditInterceptor)
    @Post('edit')
    async edit(@Body(PhoneNumberValidationPipe) userData: EditJuniorDto): Promise<Message> {
        return new Message(await this.juniorService.editJunior(userData));
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @AllowedRoles(Roles.ADMIN)
    @Get('total')
    async getTotalJuniors(): Promise<TotalViewModel> {
        return new TotalViewModel(await this.juniorService.getTotalJuniors());
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @AllowedRoles(Roles.ADMIN)
    @Get('list')
    async getAllJuniors(@Query('controls') query): Promise<JuniorUserViewModel[]> {
        const controls = query ? JSON.parse(query) as ListControlDto : undefined;
        return await this.juniorService.listAllJuniors(controls);
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
        // TODO: uncomment this line once a method has been provided to allow us to inject a Super Admin to prod.
        // if (ConfigHelper.isLive()) { throw new BadRequestException(content.NonProdFeature); }
        return await this.juniorService.getChallengeByPhoneNumber(phoneNumber);
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
        return new Message(await this.juniorService.deleteJunior(id));

    }
}
