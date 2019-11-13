import { ConfigHelper } from '../configHandler';

export const saltRounds = 10;
export const jwt = {
    secret: ConfigHelper.getJWTSecret(),
    expiry: `7d`,
};
export const maximumAttempts = 5;
