import { Controller, Post, Body, UsePipes, ValidationPipe, UseGuards, UseInterceptors, Get, Param, Delete } from '@nestjs/common';
import { RegisterAdminDto, LoginAdminDto, EditAdminDto, GetAdminDto } from './dto';
import { AdminService } from './admin.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { AllowedRoles } from '../roles/roles.decorator';
import { Roles } from '../roles/roles.enum';
import { AdminEditInterceptor } from './interceptors/edit.interceptor';
import { AdminUserViewModel } from './vm/admin.vm';
import { Admin } from './admin.decorator';
import { JWTToken } from 'src/authentication/jwt.model';

/**
 * This controller contains all actions to be carried out on the '/admin' route.
 * All returns consider the body returned in the case of success, please note:
 * - successful GETS return a 200.
 * - successful POSTS return a 201.
 * - all errors return a status code and message relevant to the issue.
 */
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly authenticationService: AuthenticationService,
  ) { }

  /**
   * TODO: This is a test route and should be removed before going live.
   *
   * This is currently used to inject a new super user.
   * @param userData - RegisterAdminDto
   * @returns - string success message
   */
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('registerTemp')
  async createTest(@Body() userData: RegisterAdminDto): Promise<string> {
    return await this.adminService.registerAdmin(userData);
  }

  /**
   * This method will return an admin view model of the id associated with the JWT.
   * @param adminData - the user data from the request
   */
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @AllowedRoles(Roles.ADMIN)
  @Get('getSelf')
  async getSelf(@Admin() adminData: any): Promise<AdminUserViewModel> {
    return new AdminUserViewModel(await this.adminService.getAdmin(adminData.id));
  }

  /**
   * A simple route that allows the frontend to tell whether the current token is valid, and belongs to an Admin/Super Admin
   *
   * @returns - true if successful, false otherwise.
   */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @AllowedRoles(Roles.ADMIN)
  @Get('login')
  async autoLogin(): Promise<boolean> {
    // This is a simple route the frontend can hit to verify a valid JWT.
    return true;
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
  async create(@Body() userData: RegisterAdminDto): Promise<string> {
    return await this.adminService.registerAdmin(userData);
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
  async edit(@Body() userData: EditAdminDto): Promise<string> {
    return await this.adminService.editAdmin(userData);
  }

  /**
   * A route used to allow superusers to list other admins.
   *
   * @return AdminUserViewModel[] - a list of all admins
   */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @AllowedRoles(Roles.SUPERUSER)
  @Get('list')
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
  async deleteAdmin(@Param('id') id: string) {
    await this.adminService.deleteAdmin(id);
  }

}
