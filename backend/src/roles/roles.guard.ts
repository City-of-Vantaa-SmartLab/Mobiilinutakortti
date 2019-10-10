import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from './roles.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Junior } from '../junior/junior.entity';
import { Repository } from 'typeorm';
import { Admin } from '../admin/admin.entity';
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        @InjectRepository(Junior)
        private readonly juniorRepo: Repository<Junior>,
        @InjectRepository(Admin)
        private readonly adminRepo: Repository<Admin>) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const roles = this.reflector.get<Roles[]>('roles', context.getHandler());
        if (!roles) {
            return true;
        }
        const request = context.switchToHttp().getRequest().user;
        const id = request.userId;
        const identity = request.user;
        const userRoles = await this.getUserRoles(id, identity);
        const hasRole = () => userRoles.some((role) => roles.includes(role));
        return id && identity && hasRole();
    }

    private async getUserRoles(id: string, identity: string): Promise<Roles[]> {
        const roles = [];
        if (await this.juniorRepo.findOne({ where: { id, phoneNumber: identity } })) {
            roles.push(Roles.JUNIOR);
        } else {
            const admin = await this.adminRepo.findOne({ where: { id, email: identity.toLowerCase() } });
            if (admin) {
                roles.push(Roles.ADMIN);
                if (admin.isSuperUser) {
                    roles.push(Roles.SUPERUSER)
                }
            }
        }
        return roles;
    }
}
