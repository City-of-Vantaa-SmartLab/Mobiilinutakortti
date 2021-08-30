import { SMSConfig } from './smsConfigHandler';

describe('SMSConfig', () => {
  beforeEach(() => {
    process.env = {};
  });

  it('returns the SMS config stored in the environment', async () => {
    Object.assign(process.env, {
      TELIA_USERNAME: 'mephisto',
      TELIA_PASSWORD: 'hunter123',
      TELIA_USER: 'Vantaa',
      TELIA_ENDPOINT: 'https://api.example.com/restsms/send',
      TELIA_BATCH_ENDPOINT: 'https://api.example.com/restsms/batch/send',
    });

    expect(SMSConfig.getTeliaConfig()).toEqual({
      batchEndPoint: 'https://api.example.com/restsms/batch/send',
      endPoint: 'https://api.example.com/restsms/send',
      password: 'hunter123',
      user: 'Vantaa',
      username: 'mephisto',
    });
  });

  it('uses fallback values for REST endpoints', async () => {
    Object.assign(process.env, {
      TELIA_USERNAME: 'mephisto',
      TELIA_PASSWORD: 'hunter123',
      TELIA_USER: 'Vantaa',
    });

    expect(SMSConfig.getTeliaConfig()).toEqual({
      batchEndPoint: 'https://ws.mkv.telia.fi/restsms/lekabrest/batchsend/json',
      endPoint: 'https://ws.mkv.telia.fi/restsms/lekabrest/send',
      password: 'hunter123',
      user: 'Vantaa',
      username: 'mephisto',
    });
  });

  it('returns undefined if username is not set in the environment', async () => {
    Object.assign(process.env, {
      TELIA_PASSWORD: 'hunter123',
      TELIA_USER: 'Vantaa',
    });

    expect(SMSConfig.getTeliaConfig()).toBe(undefined);
  });

  it('returns undefined if user is not set in the environment', async () => {
    Object.assign(process.env, {
      TELIA_USERNAME: 'mephisto',
      TELIA_PASSWORD: 'hunter123',
    });

    expect(SMSConfig.getTeliaConfig()).toBe(undefined);
  });

  it('returns undefined if password is not set in the environment', async () => {
    Object.assign(process.env, {
      TELIA_USERNAME: 'mephisto',
      TELIA_USER: 'Vantaa',
    });

    expect(SMSConfig.getTeliaConfig()).toBe(undefined);
  });
});
