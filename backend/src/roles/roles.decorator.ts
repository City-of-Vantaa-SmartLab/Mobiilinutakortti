import { SetMetadata } from '@nestjs/common';
import { Roles } from './roles.enum';

export const Allowed = (...roles: Roles[]) => SetMetadata('roles', roles);