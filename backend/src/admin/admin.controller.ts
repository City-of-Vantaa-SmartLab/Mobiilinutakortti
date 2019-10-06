import { Controller, Post, Body, UsePipes, ValidationPipe, Get, UseGuards } from '@nestjs/common';
import { RegisterAdminDto, LoginAdminDto } from './dto';
import { AdminService } from './admin.service';
import { AuthGuard } from '@nestjs/passport';
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
  ) { }

  @UsePipes(new ValidationPipe())
  @Post('register')
  async create(@Body() userData: RegisterAdminDto) {
    return this.adminService.register(userData);
  }

  @UsePipes(new ValidationPipe())
  @Post('login')
  async login(@Body() userData: LoginAdminDto) {
    return this.adminService.login(userData);
  }

  // TEST CODE AHOY
  @Get('t1')
  async getAll() {
    return this.adminService.getAll1();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('t2')
  async getAll2() {
    return this.adminService.getAll2();
  }

}
