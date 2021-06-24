import {
    Controller, UsePipes, ValidationPipe, Post, Body, UseGuards, UseInterceptors,
    Get, Param, BadRequestException, Delete, Query, Res,
} from '@nestjs/common';
import { JuniorService } from './junior.service';
import { LoginJuniorDto, RegisterJuniorDto, EditJuniorDto, ResetJuniorDto, ParentFormDto, SeasonExpiredDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticationService } from '../authentication/authentication.service';
import { AllowedRoles } from '../roles/roles.decorator';
import { Roles } from '../roles/roles.enum';
import { RolesGuard } from '../roles/roles.guard';
import { JuniorEditInterceptor } from './interceptors/edit.interceptor';
import { JuniorUserViewModel, JuniorQRViewModel, JuniorListViewModel } from './vm';
import { JWTToken } from '../authentication/jwt.model';
import { Junior } from './junior.decorator';
import { Message, Check } from '../common/vm';
import { Challenge } from './entities';
// Note, do not delete these imports, they are not currently in use but are used in the commented out code to be used later in prod.
// The same note is made for the earlier imported BadRequestException
import { ConfigHelper } from '../configHandler';
import * as content from '../content.json';
import { ListControlDto, FilterDto } from '../common/dto';
import { PhoneNumberValidationPipe } from './pipes/phoneNumberValidation.pipe';
import { ResetPhoneNumberValidationPipe } from './pipes/resetPhoneNumberValidation.pipe';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller(`${content.Routes.api}/junior`)
@ApiTags('Junior')
export class JuniorController {

    constructor(
        private readonly juniorService: JuniorService,
        private readonly authenticationService: AuthenticationService,
    ) { }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @AllowedRoles(Roles.ADMIN)
    @Post('register')
    @ApiBearerAuth('admin')
    async registerJunior(@Body(PhoneNumberValidationPipe) userData: RegisterJuniorDto): Promise<Message> {
        return new Message(await this.juniorService.registerJunior(userData));
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @Post('parent-register')
    async registerJuniorByParent(@Body(PhoneNumberValidationPipe) parentFormData: ParentFormDto): Promise<Message> {
        const { userData, securityContext } = parentFormData;
        return new Message(await this.juniorService.registerByParent(parentFormData));
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @AllowedRoles(Roles.JUNIOR)
    @Get('getSelf')
    @ApiBearerAuth('junior')
    async getSelf(@Junior() juniorData: any): Promise<JuniorQRViewModel> {
        return new JuniorQRViewModel(await this.juniorService.getJunior(juniorData.userId));
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @AllowedRoles(Roles.JUNIOR)
    @Get('login')
    @ApiBearerAuth('junior')
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
    @ApiBearerAuth('admin')
    async edit(@Body(PhoneNumberValidationPipe) userData: EditJuniorDto): Promise<Message> {
        return new Message(await this.juniorService.editJunior(userData));
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @AllowedRoles(Roles.ADMIN)
    @Get('list')
    @ApiBearerAuth('admin')
    async getAllJuniors(@Query('controls') query): Promise<JuniorListViewModel> {
        const controls = query ? JSON.parse(query) as ListControlDto : undefined;
        return await this.juniorService.listAllJuniors(controls);
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @AllowedRoles(Roles.ADMIN)
    @Get('nextAvailableDummyPhoneNumber')
    @ApiBearerAuth('admin')
    async getNextAvailableDummyPhoneNumber(): Promise<Message> {
        return new Message(await this.juniorService.getNextAvailableDummyPhoneNumber());
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @AllowedRoles(Roles.ADMIN)
    @Get(':id')
    @ApiBearerAuth('admin')
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
        const allow = process.env.SUPER_ADMIN_FEATURES || "no";
        if (allow === "yes") {
            return await this.juniorService.getChallengeByPhoneNumber(phoneNumber);
        }
        throw new BadRequestException(content.NonProdFeature);
    }

    /**
     * Deletes the junior account associated to the id provided.
     * @param id - the id of the junior to delete
     */
    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @AllowedRoles(Roles.ADMIN)
    @Delete(':id')
    @ApiBearerAuth('admin')
    async deleteJunior(@Param('id') id: string) {
        return new Message(await this.juniorService.deleteJunior(id));
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @AllowedRoles(Roles.SUPERUSER)
    @Post('newSeason')
    @ApiBearerAuth('super-admin')
    async createNewSeason(@Body() expireDate: SeasonExpiredDto) {
        return new Message(await this.juniorService.createNewSeason(expireDate));
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @AllowedRoles(Roles.SUPERUSER)
    @Delete('newSeason/clearExpired')
    @ApiBearerAuth('super-admin')
    async deleteExpiredJuniors() {
        return new Message(await this.juniorService.deleteExpired());
    }

    @Post('createTestDataJuniors')
    async createTestDataJuniors(@Body() body: any): Promise<Message> {
        const allow = process.env.SUPER_ADMIN_FEATURES || "no";
        if (allow === "yes") {
            const { numberOfCases } = body;
            return new Message(await this.juniorService.createTestDataJuniors(numberOfCases));
        }
        throw new BadRequestException(content.NonProdFeature);
    }

    @Post('deleteTestDataJuniors')
    async deleteTestDataJuniors(): Promise<Message> {
        const allow = process.env.SUPER_ADMIN_FEATURES || "no";
        if (allow === "yes") {
            return new Message(await this.juniorService.deleteTestDataJuniors());
        }
        throw new BadRequestException(content.NonProdFeature);
    }

}
