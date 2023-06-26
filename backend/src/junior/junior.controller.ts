import {
    Controller, UsePipes, ValidationPipe, Post, Body, UseGuards, UseInterceptors,
    Get, Param, BadRequestException, Delete, Query
} from '@nestjs/common';
import { JuniorService } from './junior.service';
import { LoginJuniorDto, RegisterJuniorDto, EditJuniorDto, ResetJuniorDto, ParentFormDto, SeasonExpiredDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticationService } from '../authentication/authentication.service';
import { AllowedRoles } from '../roles/roles.decorator';
import { Roles } from '../roles/roles.enum';
import { RolesGuard } from '../roles/roles.guard';
import { SessionGuard } from '../session/session.guard';
import { JuniorEditInterceptor } from './interceptors/edit.interceptor';
import { JuniorUserViewModel, JuniorQRViewModel, JuniorListViewModel } from './vm';
import { JWTToken } from '../authentication/jwt.model';
import { YouthWorker } from '../youthWorker/youthWorker.decorator';
import { Junior } from './junior.decorator';
import { Message, Check } from '../common/vm';
import { Challenge } from './entities';
import * as content from '../content';
import { ListControlDto } from '../common/dto';
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
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.YOUTHWORKER)
    @Post('register')
    @ApiBearerAuth('youthWorker')
    async registerJunior(@YouthWorker() youthWorker: { userId: string }, @Body(PhoneNumberValidationPipe) userData: RegisterJuniorDto): Promise<Message> {
        return new Message(await this.juniorService.registerJunior(userData, youthWorker.userId));
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @Post('parent-register')
    async registerJuniorByParent(@Body(PhoneNumberValidationPipe) parentFormData: ParentFormDto): Promise<Message> {
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
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.YOUTHWORKER)
    @UseInterceptors(JuniorEditInterceptor)
    @Post('edit')
    @ApiBearerAuth('youthWorker')
    async edit(@YouthWorker() youthWorker: { userId: string }, @Body(PhoneNumberValidationPipe) userData: EditJuniorDto): Promise<Message> {
        return new Message(await this.juniorService.editJunior(userData, youthWorker.userId));
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.YOUTHWORKER)
    @Get('list')
    @ApiBearerAuth('youthWorker')
    async getAllJuniors(@YouthWorker() youthWorker: { userId: string }, @Query('controls') query): Promise<JuniorListViewModel> {
        const controls = query ? JSON.parse(query) as ListControlDto : undefined;
        return await this.juniorService.listAllJuniors(controls, youthWorker.userId);
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.YOUTHWORKER)
    @Get('nextAvailableDummyPhoneNumber')
    @ApiBearerAuth('youthWorker')
    async getNextAvailableDummyPhoneNumber(): Promise<Message> {
        return new Message(await this.juniorService.getNextAvailableDummyPhoneNumber());
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.YOUTHWORKER)
    @Get(':id')
    @ApiBearerAuth('youthWorker')
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
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.YOUTHWORKER)
    @Delete(':id')
    @ApiBearerAuth('youthWorker')
    async deleteJunior(@YouthWorker() youthWorker: { userId: string }, @Param('id') id: string) {
        return new Message(await this.juniorService.deleteJunior(id, youthWorker.userId));
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.ADMIN)
    @Post('newSeason')
    @ApiBearerAuth('admin')
    async createNewSeason(@Body() expireDate: SeasonExpiredDto) {
        return new Message(await this.juniorService.createNewSeason(expireDate));
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
    @AllowedRoles(Roles.ADMIN)
    @Delete('newSeason/clearExpired')
    @ApiBearerAuth('admin')
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
