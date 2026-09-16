import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from './../src/app.module'
import { DataSource } from 'typeorm'
import { RegisterYouthWorkerDto, LoginYouthWorkerDto } from '../src/youthWorker/dto'
import { RegisterJuniorDto } from '../src/junior/dto'
import { getTestDB } from './testdb'
import { getDataSourceToken } from '@nestjs/typeorm'
import { INestApplication, Logger } from '@nestjs/common'
import { jest } from '@jest/globals'
import * as content from '../src/content'
import { Club } from '../src/club/entities'

describe('AnnouncementController (e2e)', () => {
    let app: INestApplication<any>
    let connection: DataSource
    let token: string
    let firstClubId: number
    let secondClubId: number

    const originalEnv = process.env

    const testYouthWorkerRegister = {
        email: 'announcement.admin@gofore.com', password: 'Password',
        firstName: 'Announcement', lastName: 'Admin', isAdmin: true,
    } as RegisterYouthWorkerDto

    const testYouthWorkerLogin = {
        email: testYouthWorkerRegister.email, password: testYouthWorkerRegister.password,
    } as LoginYouthWorkerDto

    const testJuniorRegister = {
        phoneNumber: '0411234500',
        firstName: 'Email',
        lastName: 'Recipient',
        postCode: '02130',
        school: 'Test School',
        class: '5A',
        parentsName: 'Parent Person',
        parentsPhoneNumber: '0411234567',
        smsPermissionParent: true,
        parentsEmail: 'parent@example.com',
        emailPermissionParent: true,
        communicationsLanguage: 'fi',
        status: 'accepted',
        photoPermission: true,
        gender: 'M',
        birthday: new Date().toISOString(),
        homeYouthClub: 1,
    } as unknown as RegisterJuniorDto

    const secondJuniorRegister = {
        phoneNumber: '0411234501',
        firstName: 'Email',
        lastName: 'Recipient Two',
        postCode: '02130',
        school: 'Test School',
        class: '5A',
        parentsName: 'Parent Person Two',
        parentsPhoneNumber: '0411234568',
        smsPermissionParent: true,
        parentsEmail: 'parent2@example.com',
        emailPermissionParent: true,
        communicationsLanguage: 'fi',
        status: 'accepted',
        photoPermission: true,
        gender: 'F',
        birthday: new Date().toISOString(),
        homeYouthClub: 2,
    } as unknown as RegisterJuniorDto

    beforeAll(async () => {
        process.env = { ...originalEnv }
        delete process.env.AWS_SES_KEY_ID
        delete process.env.AWS_SES_KEY_VALUE
        delete process.env.AWS_SES_REGION
        delete process.env.EMAIL_SOURCE
        delete process.env.EMAIL_RETURN_PATH
        process.env.EMAIL_MOCK = 'true'

        connection = getTestDB()
        await connection.initialize()
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(getDataSourceToken())
            .useValue(connection)
            .compile()

        app = moduleFixture.createNestApplication()
        await app.init()

        const clubRepo = connection.getRepository(Club)
        if ((await clubRepo.count()) === 0) {
            const firstClub = await clubRepo.save({
                name: 'Test Club',
                postCode: '01300',
                active: true,
                messages: {
                    fi: 'Testiviesti',
                    en: 'Test message',
                    sv: 'Testmeddelande',
                },
            } as unknown as Club)
            const secondClub = await clubRepo.save({
                name: 'Test Club 2',
                postCode: '01301',
                active: true,
                messages: {
                    fi: 'Toinen testiviesti',
                    en: 'Second test message',
                    sv: 'Andra testmeddelande',
                },
            } as unknown as Club)
            firstClubId = firstClub.id
            secondClubId = secondClub.id
        } else {
            const clubs = await clubRepo.find({ order: { id: 'ASC' } })
            firstClubId = clubs[0].id
            secondClubId = clubs[1].id
        }

        await request(app.getHttpServer())
            .post('/api/youthworker/registerAdmin')
            .send(testYouthWorkerRegister)
        token = (await request(app.getHttpServer())
            .post('/api/youthworker/login')
            .send(testYouthWorkerLogin)).body.access_token
        await request(app.getHttpServer())
            .post('/api/junior/register')
            .set('Authorization', `Bearer ${token}`)
            .set('Accept', 'application/json')
            .send({ ...testJuniorRegister, homeYouthClub: firstClubId })
        await request(app.getHttpServer())
            .post('/api/junior/register')
            .set('Authorization', `Bearer ${token}`)
            .set('Accept', 'application/json')
            .send({ ...secondJuniorRegister, homeYouthClub: secondClubId })
    })

    afterAll(async () => {
        process.env = originalEnv
        if (connection.isInitialized) {
            await connection.destroy()
        }
        await app.close()
    })

    it('sends announcement email using mock config and service', async () => {
        const loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {})

        const response = await request(app.getHttpServer())
            .post('/api/announcement/create')
            .set('Authorization', `Bearer ${token}`)
            .set('Accept', 'application/json')
            .send({
                msgType: 'email',
                youthClub: firstClubId,
                title: {
                    fi: 'Testiotsikko',
                    en: null,
                    sv: null,
                },
                content: {
                    fi: 'Testiviesti',
                    en: null,
                    sv: null,
                },
            })
            .expect(201)

        expect(response.body.message).toBe(content.EmailAnnouncementSent)
        expect(loggerSpy).toHaveBeenCalledWith('Mock email: sending 1 messages.')

        loggerSpy.mockRestore()
    })

    it('counts recipients for one club and all clubs in email dry-run', async () => {
        const singleClubResponse = await request(app.getHttpServer())
            .post('/api/announcement/dryrun')
            .set('Authorization', `Bearer ${token}`)
            .set('Accept', 'application/json')
            .send({
                msgType: 'email',
                youthClub: firstClubId,
            })
            .expect(201)

        expect(singleClubResponse.body.message).toBe('1')

        const allClubsResponse = await request(app.getHttpServer())
            .post('/api/announcement/dryrun')
            .set('Authorization', `Bearer ${token}`)
            .set('Accept', 'application/json')
            .send({
                msgType: 'email',
                youthClub: null,
            })
            .expect(201)

        expect(allClubsResponse.body.message).toBe('2')
    })

    it('counts SMS recipients in dry-run without announcement content', async () => {
        const singleClubResponse = await request(app.getHttpServer())
            .post('/api/announcement/dryrun')
            .set('Authorization', `Bearer ${token}`)
            .set('Accept', 'application/json')
            .send({
                msgType: 'sms',
                recipient: ['parents'],
                youthClub: firstClubId,
            })
            .expect(201)

        expect(singleClubResponse.body.message).toBe('1')

        const allClubsResponse = await request(app.getHttpServer())
            .post('/api/announcement/dryrun')
            .set('Authorization', `Bearer ${token}`)
            .set('Accept', 'application/json')
            .send({
                msgType: 'sms',
                recipient: ['parents'],
                youthClub: null,
            })
            .expect(201)

        expect(allClubsResponse.body.message).toBe('2')
    })

    it('sends SMS announcement using mock SMS service', async () => {
        const loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {})

        const response = await request(app.getHttpServer())
            .post('/api/announcement/create')
            .set('Authorization', `Bearer ${token}`)
            .set('Accept', 'application/json')
            .send({
                msgType: 'sms',
                recipient: ['parents'],
                youthClub: firstClubId,
                content: {
                    fi: 'Testitekstiviesti',
                    en: null,
                    sv: null,
                },
            })
            .expect(201)

        expect(response.body.message).toBe(content.SmsBatchSent)
        expect(loggerSpy).toHaveBeenCalledWith('Mock SMS: batch sending messages (1)')

        loggerSpy.mockRestore()
    })
})