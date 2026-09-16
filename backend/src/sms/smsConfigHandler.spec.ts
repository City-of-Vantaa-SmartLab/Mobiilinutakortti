import { SMSConfig } from './smsConfigHandler'
import { InternalServerErrorException, Logger } from '@nestjs/common'
import { jest } from '@jest/globals'

const originalEnv = process.env

describe('SMSConfig', () => {
  beforeEach(() => {
    process.env = { ...originalEnv }
    delete process.env.SMS_MOCK
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('returns the SMS config stored in the environment', async () => {
    Object.assign(process.env, {
      SMS_USERNAME: 'tunnus',
      SMS_PASSWORD: 'salasana',
      SMS_SENDER: 'Vantaa',
      SMS_ENDPOINT: 'https://api.example.com/restsms/send',
      SMS_BATCH_ENDPOINT: 'https://api.example.com/restsms/batch/send',
    })

    expect(SMSConfig.getSmsConfig()).toEqual({
      batchEndPoint: 'https://api.example.com/restsms/batch/send',
      endPoint: 'https://api.example.com/restsms/send',
      password: 'salasana',
      sender: 'Vantaa',
      username: 'tunnus',
    })
  })

  it('returns mock config when SMS_MOCK is enabled', async () => {
    process.env.SMS_MOCK = 'true'

    expect(SMSConfig.getSmsConfig()).toEqual({
      batchEndPoint: 'http://localhost/mock-sms/batch',
      endPoint: 'http://localhost/mock-sms/send',
      password: 'mock-password',
      sender: 'MockSender',
      username: 'mock-user',
    })
  })

  it('throws error if username is not set in the environment', async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {})
    Object.assign(process.env, {
      SMS_PASSWORD: 'salasana',
      SMS_SENDER: 'Vantaa',
    })

    expect(SMSConfig.getSmsConfig).toThrow(InternalServerErrorException)
  })

  it('throws error if user is not set in the environment', async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {})
    Object.assign(process.env, {
      SMS_USERNAME: 'tunnus',
      SMS_PASSWORD: 'salasana',
    })

    expect(SMSConfig.getSmsConfig).toThrow(InternalServerErrorException)
  })

  it('throws error if password is not set in the environment', async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {})
    Object.assign(process.env, {
      SMS_USERNAME: 'tunnus',
      SMS_SENDER: 'Vantaa',
    })

    expect(SMSConfig.getSmsConfig).toThrow(InternalServerErrorException)
  })
})
