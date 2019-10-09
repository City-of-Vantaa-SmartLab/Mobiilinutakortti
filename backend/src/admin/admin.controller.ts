import { Controller, Post, Body, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RegisterAdminDto, LoginAdminDto } from './dto';
import { AdminService } from './admin.service';
import { Admin } from './admin.decorator';
import { AuthenticationService } from '../authentication/authentication.service';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly authenticationService: AuthenticationService,
  ) { }

  @UsePipes(new ValidationPipe())
  @Post('login')
  async login(@Body() userData: LoginAdminDto) {
    return this.authenticationService.loginAdmin(userData);
  }

  @UsePipes(new ValidationPipe())
  @Post('register')
  async create(@Body() userData: RegisterAdminDto) {
    return this.adminService.registerAdmin(userData);
  }

}
