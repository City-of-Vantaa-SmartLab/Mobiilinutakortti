import { SetMetadata } from '@nestjs/common';
import { Roles } from './roles.enum';

export const AllowedRoles = (...roles: Roles[]) => SetMetadata('roles', roles);
