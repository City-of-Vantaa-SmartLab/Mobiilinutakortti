import { Controller, Post, Body, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { RegisterAdminDto, LoginAdminDto } from './dto';
import { AdminService } from './admin.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import { Allowed } from '../roles/roles.decorator';
import { Roles } from '../roles/roles.enum';
import { EditAdminDto } from './dto/edit.dto';

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

  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('login')
  async login(@Body() userData: LoginAdminDto) {
    return await this.authenticationService.loginAdmin(userData);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Allowed(Roles.SUPERUSER)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('register')
  async create(@Body() userData: RegisterAdminDto) {
    return await this.adminService.registerAdmin(userData);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Allowed(Roles.SUPERUSER)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('register')
  async edit(@Body() userData: EditAdminDto) {
    this.adminService.editAdmin(userData);
  }

}
