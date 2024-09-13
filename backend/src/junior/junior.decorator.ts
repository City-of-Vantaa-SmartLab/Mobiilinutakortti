import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * A cleaner decorator to Access data from request.
 */
export const Junior = createParamDecorator(
  (_, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
