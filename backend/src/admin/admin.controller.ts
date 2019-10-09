import { Controller, Post, Body, UsePipes, ValidationPipe, Get, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RegisterAdminDto, LoginAdminDto } from './dto';
import { AdminService } from './admin.service';
import { RegisterJuniorDto } from '../junior/dto';
import { Admin } from './admin.decorator';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
  ) { }

  @UsePipes(new ValidationPipe())
  @Post('register/admin')
  async create(@Body() userData: RegisterAdminDto) {
    return this.adminService.register(userData);
  }

  @UsePipes(new ValidationPipe())
  @Post('login')
  async login(@Body() userData: LoginAdminDto) {
    return this.adminService.login(userData);
  }

  @UsePipes(new ValidationPipe())
  @UseGuards(AuthGuard('jwt'))
  @Post('register/junior')
  async registerJunior(@Admin() payload: any, @Body() userData: RegisterJuniorDto) {
    // TODO: replace with authguard
    await this.adminService.verifyIsAdmin(payload.user);
    return await this.adminService.registerJunior(userData);
  }
}
