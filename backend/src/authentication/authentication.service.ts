import { Injectable, Dependencies, HttpStatus, HttpException } from '@nestjs/common';
import { Admin } from '../admin/admin.entity';
import { compare, hash } from 'bcrypt';
import { AdminService } from '../admin/admin.service';
import { LoginAdminDto, RegisterAdminDto } from '../admin/dto/index';
import { JwtService } from '@nestjs/jwt';
import { saltRounds } from './constants';

@Injectable()
@Dependencies(AdminService)
export class AuthenticationService {
    constructor(
        private readonly adminService: AdminService,
        private readonly jwtService: JwtService) {
    }

    async registerAdmin(registerDto: RegisterAdminDto): Promise<string> {
        const userExists = await this.adminService.getUser(registerDto.email);
        if (userExists) { throw new HttpException(`${registerDto.email} already exists`, HttpStatus.CONFLICT); }
        const hashedPassword = await hash(registerDto.password, saltRounds);
        const admin = {
            firstName: registerDto.firstName, lastName: registerDto.lastName,
            email: registerDto.email, password: hashedPassword,
        } as Admin;
        await this.adminService.createUser(admin);
        return `${registerDto.email} created.`;
    }

    async loginAdmin(loginDto: LoginAdminDto): Promise<any> {
        const user = await this.adminService.getUser(loginDto.email);
        if (!user) { throw new HttpException('Username does not exist', HttpStatus.BAD_REQUEST); }
        const passwordCheck = await compare(loginDto.password, user.password);
        if (!passwordCheck) { throw new HttpException('Invalid Login', HttpStatus.UNAUTHORIZED); }
        return { access_token: this.jwtService.sign({ user: user.email, sub: user.id }) };
    }
}
