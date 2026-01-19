import { toBase64UrlString } from '../common/helpers';

function getRandomSecret() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return toBase64UrlString(Buffer.from(array));
}

// If using multiple instances, these two should be defined as constants in the environment variables.
export const jwtSecret = process.env.JWT_SECRET || getRandomSecret();
export const scSecret = process.env.SC_SECRET || getRandomSecret();

export const jwtExpiryForYouthWorker = '15m';
export const jwtExpiryForJunior = '30d';
export const saltRounds = 10;
export const maximumAttempts = 5;
