import { Controller, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { RegisterAdminDto, LoginAdminDto } from './dto';
import { AdminService } from './admin.service';
import { AuthenticationService } from '../authentication/authentication.service';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly authenticationService: AuthenticationService,
  ) { }

  @UsePipes(new ValidationPipe())
  @Post('register')
  async create(@Body() userData: RegisterAdminDto) {
    return this.authenticationService.registerAdmin(userData);
  }

  @UsePipes(new ValidationPipe())
  @Post('login')
  async login(@Body() userData: LoginAdminDto) {
    return this.authenticationService.loginAdmin(userData);
  }
}
