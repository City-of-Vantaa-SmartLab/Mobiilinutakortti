import {
  Controller, Post, Body, UsePipes, ValidationPipe, UseGuards, UseInterceptors,
  Get, Param, BadRequestException, Delete
} from '@nestjs/common';
import { RegisterAdminDto, LoginAdminDto, EditAdminDto } from './dto';
import { AdminService } from './admin.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { AllowedRoles } from '../roles/roles.decorator';
import { Roles } from '../roles/roles.enum';
import { AdminEditInterceptor } from './interceptors/edit.interceptor';
import { AdminUserViewModel } from './vm/admin.vm';
import { Admin } from './admin.decorator';
import { JWTToken } from '../authentication/jwt.model';
import { Message, Check } from '../common/vm';
// Note, do not delete these imports, they are not currently in use but are used in the commented out code to be used later in prod.
// The same note is made for the earlier imported BadRequestException
import { ConfigHelper } from '../configHandler';
import * as content from '../content.json';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

/**
 * This controller contains all actions to be carried out on the '/admin' route.
 * All returns consider the body returned in the case of success, please note:
 * - successful GETS return a 200.
 * - successful POSTS return a 201.
 * - all errors return a status code and message relevant to the issue.
 */
@ApiTags('Admin')
@Controller(`${content.Routes.api}/admin`)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly authenticationService: AuthenticationService,
  ) { }

  /**
   * This is used to inject a new super user. For security, needs environment variable set to work.
   * @param userData - RegisterAdminDto
   * @returns - string success message
   */
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('registerSuperAdmin')
  async registerSuperAdmin(@Body() userData: RegisterAdminDto): Promise<Message> {
    const allow = process.env.SUPER_ADMIN_FEATURES || "no";
    if ( allow === "yes" ) {
      return new Message(await this.adminService.registerAdmin(userData));
    }
    throw new BadRequestException(content.NonProdFeature);
  }

  /**
   * This method will return an admin view model of the id associated with the JWT.
   * @param adminData - the user data from the request
   */
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @AllowedRoles(Roles.ADMIN)
  @Get('getSelf')
  @ApiBearerAuth('super-admin')
  @ApiBearerAuth('admin')
  async getSelf(@Admin() adminData: any): Promise<AdminUserViewModel> {
    return new AdminUserViewModel(await this.adminService.getAdmin(adminData.userId));
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @AllowedRoles(Roles.ADMIN)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Get('refresh')
  @ApiBearerAuth('super-admin')
  @ApiBearerAuth('admin')
  async refreshJWT(@Admin() adminData: any): Promise<JWTToken> {
    return this.authenticationService.signToken(adminData.userId, true);
  }

  /**
   * A simple route that allows the frontend to tell whether the current token is valid, and belongs to an Admin/Super Admin
   *
   * @returns - true if successful, false otherwise.
   */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @AllowedRoles(Roles.ADMIN)
  @Get('login')
  @ApiBearerAuth('super-admin')
  @ApiBearerAuth('admin')
  async autoLogin(@Admin() adminData: any): Promise<Check> {
    // This is a simple route the frontend can hit to verify a valid JWT.
    return new Check(!(await this.adminService.isLockedOut(adminData.userId)));
  }

  /**
   * A route that attempts to log an admin into the system (generating a JWT).
   *
   * @param userData - LoginAdminDto
   * @returns - { access_token }
   */
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('login')
  async login(@Body() userData: LoginAdminDto): Promise<JWTToken> {
    return await this.authenticationService.loginAdmin(userData);
  }

  /**
   * A route used to register new admins.
   *
   * @param userData - RegisterAdminDto
   * @returns string - success message
   */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @AllowedRoles(Roles.SUPERUSER)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('register')
  @ApiBearerAuth('super-admin')
  async create(@Body() userData: RegisterAdminDto): Promise<Message> {
    return new Message(await this.adminService.registerAdmin(userData));
  }

  /**
   * A route used to allow superusers to edit other admins.
   *
   * @param userData - EditAdminDto
   * @return string - success message.
   */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @AllowedRoles(Roles.SUPERUSER)
  @UseInterceptors(AdminEditInterceptor)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('edit')
  @ApiBearerAuth('super-admin')
  async edit(@Body() userData: EditAdminDto): Promise<Message> {
    return new Message(await this.adminService.editAdmin(userData));
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @AllowedRoles(Roles.SUPERUSER, Roles.ADMIN)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('changePassword')
  @ApiBearerAuth('super-admin')
  async changePassword(@Admin() adminData: any, @Body() userDate: ChangePasswordDto): Promise<Message> {
    return new Message(await this.adminService.changePassword(adminData.userId, userDate));
  }

  /**
   * A route used to allow superusers to list other admins.
   *
   * @return AdminUserViewModel[] - a list of all admins
   */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @AllowedRoles(Roles.SUPERUSER)
  @Get('list')
  @ApiBearerAuth('super-admin')
  async getAllAdmins(): Promise<AdminUserViewModel[]> {
    return await this.adminService.listAllAdmins();
  }

  /**
   * Returns the view model of the admin who the id belongs to.
   * @param id - the id of the admin to get the viewmodel of.
   */
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @AllowedRoles(Roles.SUPERUSER)
  @Get(':id')
  @ApiBearerAuth('super-admin')
  async getOneAdmin(@Param('id') id: string): Promise<AdminUserViewModel> {
    return new AdminUserViewModel(await this.adminService.getAdmin(id));
  }

  /**
   * Deletes the admin account associated to the id provided.
   * @param id - the id of the admin to delete
   */
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @AllowedRoles(Roles.SUPERUSER)
  @Delete(':id')
  @ApiBearerAuth('super-admin')
  async deleteAdmin(@Param('id') id: string): Promise<Message> {
    return new Message(await this.adminService.deleteAdmin(id));
  }

}
