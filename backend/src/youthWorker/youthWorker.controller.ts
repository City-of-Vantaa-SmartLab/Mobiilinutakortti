import {
  Controller, Post, Body, UsePipes, ValidationPipe, UseGuards, UseInterceptors,
  Get, Param, BadRequestException, ForbiddenException, Delete
} from '@nestjs/common';
import { RegisterYouthWorkerDto, LoginYouthWorkerDto, EditYouthWorkerDto } from './dto';
import { YouthWorkerService } from './youthWorker.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { ApiUserGuard } from './apiuser.guard';
import { SessionGuard } from '../session/session.guard';
import { AllowedRoles } from '../roles/roles.decorator';
import { Roles } from '../roles/roles.enum';
import { YouthWorkerEditInterceptor } from './interceptors/edit.interceptor';
import { YouthWorkerUserViewModel } from './vm/youthWorker.vm';
import { YouthWorker } from './youthWorker.decorator';
import { JWTToken } from '../authentication/jwt.model';
import { Message, Check } from '../common/vm';
import * as content from '../content';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoginYouthWorkerEntraDto } from './dto/login.dto';

const useEntraID = !!process.env.ENTRA_APP_KEY_DISCOVERY_URL;

/**
 * This controller contains all actions to be carried out on the '/youthworker' route.
 * All returns consider the body returned in the case of success, please note:
 * - successful GETS return a 200.
 * - successful POSTS return a 201.
 * - all errors return a status code and message relevant to the issue.
 */
@ApiTags('YouthWorker')
@Controller(`${content.Routes.api}/youthworker`)
export class YouthWorkerController {
  constructor(
    private readonly youthWorkerService: YouthWorkerService,
    private readonly authenticationService: AuthenticationService,
  ) { }

  /**
   * This is used to inject a new admin. For security, needs environment variable set to work.
   * @param userData - RegisterYouthWorkerDto
   * @returns - string success message
   */
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('registerAdmin')
  async registerAdmin(@Body() userData: RegisterYouthWorkerDto): Promise<Message> {
    if (useEntraID) {
        throw new ForbiddenException('Microsoft Entra ID is in use. No need to register first admin.');
    }
    const allow = process.env.SETUP_ENDPOINTS || "no";
    if ( allow === "yes" ) {
      return new Message(await this.youthWorkerService.registerYouthWorker(userData));
    }
    throw new BadRequestException(content.NonProdFeature);
  }

  /**
   * This method will return a youth worker view model of the id associated with the JWT.
   * @param youthWorkerData - the user data from the request
   */
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
  @AllowedRoles(Roles.YOUTHWORKER)
  @Get('getSelf')
  @ApiBearerAuth('youthWorker')
  async getSelf(@YouthWorker() youthWorkerData: { userId: string }): Promise<YouthWorkerUserViewModel> {
    return new YouthWorkerUserViewModel(await this.youthWorkerService.getYouthWorker(youthWorkerData.userId));
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
  @AllowedRoles(Roles.YOUTHWORKER)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Get('refresh')
  @ApiBearerAuth('youthWorker')
  async refreshJWT(@YouthWorker() youthWorkerData: { userId: string, authToken: string }): Promise<JWTToken> {
    return this.authenticationService.updateAuthToken(youthWorkerData);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
  @AllowedRoles(Roles.YOUTHWORKER)
  @Get('logout')
  @ApiBearerAuth('youthWorker')
  async logout(@YouthWorker() youthWorkerData: { userId: string, authToken: string }): Promise<Check> {
    return new Check(await this.authenticationService.logoutYouthWorker(youthWorkerData));
  }

  // Do not use AuthGuard('jwt') when the user is being automatically logged out as the token might be expired.
  // Use the ApiUserGuard instead.
  @UseGuards(ApiUserGuard, RolesGuard, SessionGuard)
  @AllowedRoles(Roles.YOUTHWORKER)
  @Get('autologout')
  @ApiBearerAuth('youthWorker')
  async autologout(@YouthWorker() youthWorkerData: { userId: string, authToken: string }): Promise<Check> {
    return new Check(await this.authenticationService.logoutYouthWorker(youthWorkerData, true));
  }

  /**
   * A route that validates entraId login. If successful, a JWT access token is returned.
   *
   * @returns - JWTToken
   */
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('loginEntraID')
  async loginEntra(@Body() loginData: LoginYouthWorkerEntraDto): Promise<JWTToken> {
    if (!useEntraID) {
        throw new ForbiddenException('Local login is enabled. Microsoft Entra ID is not in use.');
    }
    return await this.authenticationService.loginYouthWorkerEntraID(loginData);
  }

  /**
   * A route that attempts to log a youth worker into the system (generating a JWT).
   *
   * @param userData - LoginYouthWorkerDto
   * @returns - JWTToken
   */
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('login')
  async login(@Body() userData: LoginYouthWorkerDto): Promise<JWTToken> {
    if (useEntraID) {
        throw new ForbiddenException('Microsoft Entra ID is in use. Local login is disabled.');
    }
    return await this.authenticationService.loginYouthWorker(userData);
  }

  /**
   * A route used to register new youth workers.
   *
   * @param userData - RegisterYouthWorkerDto
   * @returns string - success message
   */
  @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
  @AllowedRoles(Roles.ADMIN)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('register')
  @ApiBearerAuth('admin')
  async create(@YouthWorker() admin: { userId: string }, @Body() userData: RegisterYouthWorkerDto): Promise<Message> {
    if (useEntraID) {
        throw new ForbiddenException('Microsoft Entra ID is in use. Creating users locally is disabled.');
    }
    return new Message(await this.youthWorkerService.registerYouthWorker(userData, admin.userId));
  }

  /**
   * A route used to allow admins to edit youth workers.
   *
   * @param userData - EditYouthWorkerDto
   * @return string - success message.
   */
  @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
  @AllowedRoles(Roles.ADMIN)
  @UseInterceptors(YouthWorkerEditInterceptor)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('edit')
  @ApiBearerAuth('admin')
  async edit(@YouthWorker() admin: { userId: string }, @Body() userData: EditYouthWorkerDto): Promise<Message> {
    return new Message(await this.youthWorkerService.editYouthWorker(userData, admin.userId));
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
  @AllowedRoles(Roles.ADMIN, Roles.YOUTHWORKER)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('changePassword')
  @ApiBearerAuth('admin')
  @ApiBearerAuth('youthWorker')
  async changePassword(@YouthWorker() youthWorkerData: { userId: string }, @Body() userDate: ChangePasswordDto): Promise<Message> {
    if (useEntraID) {
        throw new ForbiddenException('Microsoft Entra ID is in use. Password management is disabled.');
    }
    return new Message(await this.youthWorkerService.changePassword(youthWorkerData.userId, userDate));
  }

  /**
   * A route used to allow admins to list youth workers.
   *
   * @return YouthWorkerUserViewModel[] - a list of all youth workers
   */
  @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
  @AllowedRoles(Roles.ADMIN)
  @Get('list')
  @ApiBearerAuth('admin')
  async getAllYouthWorkers(): Promise<YouthWorkerUserViewModel[]> {
    return await this.youthWorkerService.listAllYouthWorkers();
  }

  /**
   * Returns the view model of the youth worker who the id belongs to.
   * @param id - the id of the youth worker to get the viewmodel of.
   */
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
  @AllowedRoles(Roles.ADMIN)
  @Get(':id')
  @ApiBearerAuth('admin')
  async getOneYouthWorker(@Param('id') id: string): Promise<YouthWorkerUserViewModel> {
    return new YouthWorkerUserViewModel(await this.youthWorkerService.getYouthWorker(id));
  }

  /**
   * Deletes the youth worker account associated to the id provided.
   * @param id - the id of the youth worker to delete
   */
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
  @AllowedRoles(Roles.ADMIN)
  @Delete(':id')
  @ApiBearerAuth('admin')
  async deleteYouthWorker(@YouthWorker() admin: { userId: string }, @Param('id') id: string): Promise<Message> {
    return new Message(await this.youthWorkerService.deleteYouthWorker(id, admin.userId));
  }

  /**
   * Sets the main (default) youth club for the youth worker for whom the bearer token belongs to.
   */
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
  @AllowedRoles(Roles.ADMIN, Roles.YOUTHWORKER)
  @Post('setMainYouthClub')
  @ApiBearerAuth('admin')
  @ApiBearerAuth('youthWorker')
  async setMainYouthClub(@YouthWorker() youthWorker: { userId: string }, @Body() body: { clubId: number }): Promise<Check> {
    return new Check(await this.youthWorkerService.setMainYouthClub(body.clubId, youthWorker.userId));
  }
}
