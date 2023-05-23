import {
  Controller, Post, Body, UsePipes, ValidationPipe, UseGuards, UseInterceptors,
  Get, Param, BadRequestException, Delete
} from '@nestjs/common';
import { RegisterYouthWorkerDto, LoginYouthWorkerDto, EditYouthWorkerDto } from './dto';
import { YouthWorkerService } from './admin.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { SessionGuard } from '../session/session.guard';
import { AllowedRoles } from '../roles/roles.decorator';
import { Roles } from '../roles/roles.enum';
import { YouthWorkerEditInterceptor } from './interceptors/edit.interceptor';
import { YouthWorkerUserViewModel } from './vm/admin.vm';
import { YouthWorker } from './admin.decorator';
import { JWTToken } from '../authentication/jwt.model';
import { Message, Check } from '../common/vm';
import * as content from '../content';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

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
    const allow = process.env.SUPER_ADMIN_FEATURES || "no";
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
  @ApiBearerAuth('admin')
  @ApiBearerAuth('youthWorker')
  async getSelf(@YouthWorker() youthWorkerData: any): Promise<YouthWorkerUserViewModel> {
    return new YouthWorkerUserViewModel(await this.youthWorkerService.getYouthWorker(youthWorkerData.userId));
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
  @AllowedRoles(Roles.YOUTHWORKER)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Get('refresh')
  @ApiBearerAuth('admin')
  @ApiBearerAuth('youthWorker')
  async refreshJWT(@YouthWorker() youthWorkerData: any): Promise<JWTToken> {
    return this.authenticationService.updateAuthToken(youthWorkerData);
  }

  /**
   * A simple route that allows the frontend to tell whether the current token is valid, and belongs to a youth worker/admin
   *
   * @returns - true if successful, false otherwise.
   */
  @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
  @AllowedRoles(Roles.YOUTHWORKER)
  @Get('login')
  @ApiBearerAuth('admin')
  @ApiBearerAuth('youthWorker')
  async autoLogin(@YouthWorker() youthWorkerData: any): Promise<Check> {
    // This is a simple route the frontend can hit to verify a valid JWT.
    return new Check(!(await this.youthWorkerService.isLockedOut(youthWorkerData.userId)));
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
  @AllowedRoles(Roles.YOUTHWORKER)
  @Get('logout')
  @ApiBearerAuth('admin')
  @ApiBearerAuth('youthWorker')
  async logout(@YouthWorker() youthWorkerData: any): Promise<Check> {
    return new Check(await this.authenticationService.logoutYouthWorker(youthWorkerData));
  }

  /**
   * A route that attempts to log a youth worker into the system (generating a JWT).
   *
   * @param userData - LoginYouthWorkerDto
   * @returns - { access_token }
   */
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('login')
  async login(@Body() userData: LoginYouthWorkerDto): Promise<JWTToken> {
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
  async create(@Body() userData: RegisterYouthWorkerDto): Promise<Message> {
    return new Message(await this.youthWorkerService.registerYouthWorker(userData));
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
  async edit(@Body() userData: EditYouthWorkerDto): Promise<Message> {
    return new Message(await this.youthWorkerService.editYouthWorker(userData));
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard, SessionGuard)
  @AllowedRoles(Roles.ADMIN, Roles.YOUTHWORKER)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('changePassword')
  @ApiBearerAuth('admin')
  async changePassword(@YouthWorker() youthWorkerData: any, @Body() userDate: ChangePasswordDto): Promise<Message> {
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
  async deleteYouthWorker(@Param('id') id: string): Promise<Message> {
    return new Message(await this.youthWorkerService.deleteYouthWorker(id));
  }

}
