import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { verify, decode, JwtPayload, TokenExpiredError } from 'jsonwebtoken';
import { jwt } from '../authentication/authentication.consts';

// This is a guard that accepts expired JWTs.
// It's meant to mainly extract the userId from the auth token.

@Injectable()
export class ApiUserGuard implements CanActivate {

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) return false;

    try {
      verify(token, jwt.secret);
    } catch (error) {
      if (!(error instanceof TokenExpiredError)) return false;
    }

    try {
      const payload: JwtPayload = decode(token, { json: true });

      // Allow for 5 minutes old tokens to pass the auto logout.
      // Frontend has an auto refresh interval of 10 minutes and backend issues tokens with 15 minute expiry time.
      const freshEnough = (Math.round(Date.now() / 1000) - payload.exp) < 300;
      if (!freshEnough) return false;

      // Set the user for other guards.
      request['user'] = { userId: payload.sub };
    } catch {
      return false;
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
