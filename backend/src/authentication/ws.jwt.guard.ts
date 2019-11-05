import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class WsJwtGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService) { }

    async canActivate(context: ExecutionContext) {
        const client = context.switchToWs().getClient();
        const token = client.handshake.query.token;
        const jwtPayload = await this.jwtService.verifyAsync(token);
        client.handshake.query.token = jwtPayload.sub;
        return Boolean(jwtPayload);
    }
}
