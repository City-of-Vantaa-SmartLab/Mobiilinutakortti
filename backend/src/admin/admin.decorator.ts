import { createParamDecorator } from '@nestjs/common';

export const Admin = createParamDecorator((data, req) => req.user);
