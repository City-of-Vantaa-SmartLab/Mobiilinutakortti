import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Connection } from 'typeorm';
import { RegisterAdminDto, LoginAdminDto } from '../src/admin/dto';
import { getTestDB } from './testdb';
import { RegisterJuniorDto, LoginJuniorDto } from '../src/junior/dto';

describe('JuniorController (e2e)', () => {
    let app;
    let connection: Connection;
    let token: string;

    const testAdminRegister = {
        email: 'Testy.McTempFace@gofore.com', password: 'Password',
        firstName: 'Testy', lastName: 'McTestFace', isSuperUser: true,
    } as RegisterAdminDto;

    const testJuniorRegister = {
        phoneNumber: '04122345671',
        firstName: 'Testy jr the second', lastName: 'e2e2',
    } as RegisterJuniorDto;

    const testAdminLogin = {
        email: testAdminRegister.email, password: testAdminRegister.password,
    } as LoginAdminDto;

    let testJuniorLogin: LoginJuniorDto;

    beforeAll(async () => {
        // Create a connection to a test DB
        connection = await getTestDB();
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(Connection)
            .useValue(connection)
            .compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        await request(app.getHttpServer())
            .post('/admin/registerTemp')
            .send(testAdminRegister);
        token = (await request(app.getHttpServer())
            .post('/admin/login')
            .send(testAdminLogin)).body.access_token;
        const pin = (await request(app.getHttpServer())
            .post('/junior/register')
            .set('Authorization', `Bearer ${token}`)
            .set('Accept', 'application/json')
            .send(testJuniorRegister));
        testJuniorLogin = { id: testJuniorRegister.phoneNumber, pin: pin.text };
    });

    afterAll(async () => {
        await connection.close();
        await app.close();
    });

    describe('/junior/register', () => {
        it('returns a pin (temporary) if a new user is created', async () => {
            const testData = {
                phoneNumber: '04112345677',
                firstName: testJuniorRegister.firstName, lastName: testJuniorRegister.lastName,
            } as RegisterJuniorDto;
            return request(app.getHttpServer())
                .post('/junior/register')
                .set('Authorization', `Bearer ${token}`)
                .set('Accept', 'application/json')
                .send(testData)
                .expect(201);
        }),
            it('returns a Conflict if the user already exists', async () => {
                return request(app.getHttpServer())
                    .post('/junior/register')
                    .set('Authorization', `Bearer ${token}`)
                    .set('Accept', 'application/json')
                    .send(testJuniorRegister)
                    .expect(409);
            }),
            it('returns an Bad Request if invalid data is entered', () => {
                const testData = { firstName: 'Bob', lastName: 'Bobby' };
                return request(app.getHttpServer())
                    .post('/junior/register')
                    .set('Authorization', `Bearer ${token}`)
                    .set('Accept', 'application/json')
                    .send(testData)
                    .expect(400);
            }),
            it('returns an Unauthorized if no JWT token is provided', () => {
                return request(app.getHttpServer())
                    .post('/junior/register')
                    .send(testJuniorRegister)
                    .expect(401);
            });
    });

    describe('/junior/login', () => {
        it('returns a JWT token on a succesful login', () => {
            return request(app.getHttpServer())
                .post('/junior/login')
                .send(testJuniorLogin)
                .expect('Content-Type', /json/)
                .expect(201).then(response => {
                    expect(response !== null);
                });
        }),
            it('returns a Bad Request if the phone number does not exist', () => {
                const testData = { id: '04122345670', pin: testJuniorLogin.pin } as LoginJuniorDto;
                return request(app.getHttpServer())
                    .post('/junior/login')
                    .send(testData)
                    .expect(400);
            }),
            it('returns Unauthorized if an invalid pin is provided', () => {
                const testData = { id: testJuniorLogin.id, pin: '12345' } as LoginJuniorDto;
                return request(app.getHttpServer())
                    .post('/junior/login')
                    .send(testData)
                    .expect(401);
            }),
            it('returns a Bad Request if invalid data is entered', () => {
                const testData = { phoneNumber: testJuniorLogin.id };
                return request(app.getHttpServer())
                    .post('/junior/login')
                    .send(testData)
                    .expect(400);
            });
    });
});
