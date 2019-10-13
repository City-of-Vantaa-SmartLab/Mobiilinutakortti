import { Controller, Post, Body, UsePipes, ValidationPipe, UseGuards, UseInterceptors, Get } from '@nestjs/common';
import { RegisterAdminDto, LoginAdminDto, EditAdminDto } from './dto';
import { AdminService } from './admin.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { AllowedRoles } from '../roles/roles.decorator';
import { Roles } from '../roles/roles.enum';
import { AdminEditInterceptor } from './interceptors/edit.interceptor';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly authenticationService: AuthenticationService,
  ) { }

  // TODO remove this before Live, only provided to allow simplified testing.
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('registerTemp')
  async createTest(@Body() userData: RegisterAdminDto) {
    return await this.adminService.registerAdmin(userData);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @AllowedRoles(Roles.ADMIN)
  @Get('login')
  async autoLogin() {
    // This is a simple route the frontend can hit to verify a valid JWT.
    return true;
  }

  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('login')
  async login(@Body() userData: LoginAdminDto) {
    return await this.authenticationService.loginAdmin(userData);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @AllowedRoles(Roles.SUPERUSER)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('register')
  async create(@Body() userData: RegisterAdminDto) {
    return await this.adminService.registerAdmin(userData);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @AllowedRoles(Roles.SUPERUSER)
  @UseInterceptors(AdminEditInterceptor)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('edit')
  async edit(@Body() userData: EditAdminDto) {
    return await this.adminService.editAdmin(userData);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @AllowedRoles(Roles.SUPERUSER)
  @Get('list')
  async getAllAdmins() {
    return await this.adminService.listAllAdmins();
  }

}
