import { ConfigHandler } from '../configHandler';

// Expires August 31st
const juniorExpiryMonth = 7;
const juniorExpiryDay = 31;

function getDaysUntilNextExpiry(): number {
    const expiry = new Date();
    expiry.setMonth(juniorExpiryMonth, juniorExpiryDay);
    if (expiry < new Date()) { expiry.setFullYear(expiry.getFullYear() + 1); }
    const expiryTimeInMS = expiry.getTime() - new Date().getTime();
    return Math.round((expiryTimeInMS / (60 * 60 * 24 * 1000)));
}

export const saltRounds = 10;
export const jwt = {
    secret: ConfigHandler.getJWTSecret(),
    juniorExpiry: `${getDaysUntilNextExpiry()}d`,
    youthWorkerExpiry: `15m`,
};
export const maximumAttempts = 5;
