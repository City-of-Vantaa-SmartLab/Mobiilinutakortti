import { createParamDecorator } from '@nestjs/common';

/**
 * A cleaner decorator to Access data from request.
 */
export const WSJunior = createParamDecorator((data, req) => req.user);
