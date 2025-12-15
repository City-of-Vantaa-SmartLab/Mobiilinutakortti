import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { verify, decode, JwtPayload, TokenExpiredError } from 'jsonwebtoken';
import { jwtSecret } from '../authentication/authentication.consts';

// This is a guard that accepts slightly expired JWTs.
// It's meant to mainly extract the userId from the auth token.

@Injectable()
export class ApiUserGuard implements CanActivate {

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) return false;

    try {
      verify(token, jwtSecret);
    } catch (error) {
      if (!(error instanceof TokenExpiredError)) return false;
    }

    try {
      const payload: JwtPayload = decode(token, { json: true });

      // Frontend has an auto logout interval but backend issued tokens might have just expired.
      // Allow for just expired tokens to pass e.g. for the auto logout.
      const allowedDifferenceInSeconds = 10;
      const freshEnough = (Math.round(Date.now() / 1000) - payload.exp) < allowedDifferenceInSeconds;
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
