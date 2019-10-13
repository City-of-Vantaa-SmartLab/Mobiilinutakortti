import { createParamDecorator } from '@nestjs/common';
// TODO remove this if no longer needed, currently keeping incase we find future use.
export const Admin = createParamDecorator((data, req) => req.user);
