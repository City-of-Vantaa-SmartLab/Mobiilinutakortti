import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Junior } from '../junior/entities';
import { Repository } from 'typeorm';
import { YouthWorker } from '../youthWorker/entities';
import { Roles } from './roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        @InjectRepository(Junior)
        private readonly juniorRepo: Repository<Junior>,
        @InjectRepository(YouthWorker)
        private readonly youthWorkerRepo: Repository<YouthWorker>,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const roles = this.reflector.get<Roles[]>('roles', context.getHandler());
        if (!roles) { return true; }
        const userId: string = context.switchToHttp().getRequest().user ? context.switchToHttp().getRequest().user.userId
            : context.switchToWs().getClient().handshake?.query.token;
        if (!userId) { return false; }
        const userRoles = await this.getUserRoles(userId);
        return userRoles.some((role) => roles.includes(role));
    }

    private async getUserRoles(id: string): Promise<Roles[]> {
        const roles = [];
        const isJunior = await this.juniorRepo.findOneBy({ id });
        if (isJunior) {
            roles.push(Roles.JUNIOR);
        } else {
            const youthWorker = await this.youthWorkerRepo.findOneBy({ id });
            if (youthWorker) {
                roles.push(Roles.YOUTHWORKER);
                if (youthWorker.isAdmin) {
                    roles.push(Roles.ADMIN);
                }
            }
        }
        return roles;
    }
}
