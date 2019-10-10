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

  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('login')
  async login(@Body() userData: LoginAdminDto) {
    return await this.authenticationService.loginAdmin(userData);
  }

  // Todo, require the above before live. leaving during dev so that we can create admins easily.
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Allowed(Roles.ADMIN)
  // @UsePipes(new ValidationPipe({ transform: true }))
  @Post('register')
  async create(@Body() userData: RegisterAdminDto) {
    return await this.adminService.registerAdmin(userData);
  }

}
