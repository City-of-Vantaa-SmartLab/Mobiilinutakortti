import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Junior } from '../junior/entities';
import { Repository } from 'typeorm';
import { Admin } from '../admin/admin.entity';
import { Roles } from './roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        @InjectRepository(Junior)
        private readonly juniorRepo: Repository<Junior>,
        @InjectRepository(Admin)
        private readonly adminRepo: Repository<Admin>,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const roles = this.reflector.get<Roles[]>('roles', context.getHandler());
        if (!roles) { return true; }
        const userId: string = context.switchToHttp().getRequest().user ? context.switchToHttp().getRequest().user.userId
            : context.switchToWs().getClient().handshake.query.token;
        if (!userId) { return false; }
        const userRoles = await this.getUserRoles(userId);
        const hasRoles = () => userRoles.some((role) => roles.includes(role));
        return hasRoles();
    }

    private async getUserRoles(id: string): Promise<Roles[]> {
        const roles = [];
        const isJunior = await this.juniorRepo.findOne(id);
        if (isJunior) {
            roles.push(Roles.JUNIOR);
        } else {
            const admin = await this.adminRepo.findOne(id);
            if (admin) {
                roles.push(Roles.ADMIN);
                if (admin.isSuperUser) {
                    roles.push(Roles.SUPERUSER);
                }
            }
        }
        return roles;
    }
}
