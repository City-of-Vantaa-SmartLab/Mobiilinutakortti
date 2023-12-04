import { ConfigHandler } from '../configHandler';

// Expires August 31st
const juniorExpiryMonth = 7;
const juniorExpiryDay = 31;

function getDaysUntilNextExpiry(): number {
  const expiry = new Date();
  expiry.setMonth(juniorExpiryMonth, juniorExpiryDay);
  if (expiry < new Date()) {
    expiry.setFullYear(expiry.getFullYear() + 1);
  }
  const expiryTimeInMS = expiry.getTime() - new Date().getTime();
  return Math.round(expiryTimeInMS / (60 * 60 * 24 * 1000));
}

export const saltRounds = 10;
export const jwt = {
  secret: ConfigHandler.getJWTSecret(),
  juniorExpiry: `${getDaysUntilNextExpiry()}d`,
  youthWorkerExpiry: `15m`,
};
export const maximumAttempts = 5;

/*  
*
Entra access token validation helpers 
*
*/
const PEM_START = '-----BEGIN CERTIFICATE-----\n';
const PEM_END = '\n-----END CERTIFICATE-----\n';

let refreshDate: Date = new Date();
let keys: KeyData[] = [];

interface KeyData {
  kid: string;
  x5c: string[];
}

interface AuthClaims {
  aud: string;
  scp: string;
}

// Load the public key from App discovery url and extract the public key from entra certificate
export async function getPublicKey(kid: string): Promise<string | null> {
  const keys = await loadMsKeys();

  for (const key of keys) {
    // Find the key that matches the kid in the access token's header.
    if (key.kid === kid) {
      // Construct the public key object.
      const msPublicKey = key.x5c[0];
      const publicKey = PEM_START + msPublicKey + PEM_END;
      return publicKey;
    }
  }
  return null;
}

// Load the Entra AD keys
export async function loadMsKeys() {
  if (keys.length > 0 && refreshDate.getDate() === new Date().getDate()) {
    return;
  }

  try {
    const response = await fetch(process.env.ENTRA_APP_KEY_DISCOVERY_URL);
    const data = await response.json();
    keys = data.keys;
    refreshDate = new Date();
    console.log('Entra AD keys updated');
  } catch (error) {
    console.log('Entra AD key fetching failed', error);
  }
  return keys;
}

export function getAudienceAndScope(bodyText: string): AuthClaims {
  const bodyStr = Buffer.from(bodyText, 'base64').toString();
  const body: AuthClaims = JSON.parse(bodyStr);
  return { aud: body.aud, scp: body.scp };
}
