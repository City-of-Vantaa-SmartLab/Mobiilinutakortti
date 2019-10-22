import { createParamDecorator } from '@nestjs/common';

/**
 * A cleaner decorator to Access data from request.
 */
export const Junior = createParamDecorator((data, req) => req.user);
