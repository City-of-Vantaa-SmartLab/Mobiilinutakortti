import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const YouthWorker = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const authToken = (request?.headers?.authorization || '').substring('Bearer '.length);
    return { userId: request.user.userId, authToken }
  },
);
