import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { SessionDBService } from './sessiondb.service';

@Injectable()
export class SessionGuard implements CanActivate {
    constructor(
        private readonly sessionDBService: SessionDBService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authToken = (request?.headers?.authorization || '').substring('Bearer '.length);
        const userId = request.user.userId;
        if (!userId || !authToken) { return false; }
        return this.sessionDBService.checkValidity(userId, authToken);
    }
}
