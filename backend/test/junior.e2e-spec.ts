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

    const testAdminRegister = {
        email: 'Testy.McTempFace@gofore.com', password: 'Password',
        firstName: 'Testy', lastName: 'McTestFace',
    } as RegisterAdminDto;

    const testJuniorRegister = {
        phoneNumber: '+441234567809',
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
            .post('/admin/register/admin')
            .send(testAdminRegister);
        const token = (await request(app.getHttpServer())
            .post('/admin/login')
            .send(testAdminLogin)).body.access_token;
        const pin = (await request(app.getHttpServer())
            .post('/admin/register/junior')
            .set('Authorization', `Bearer ${token}`)
            .set('Accept', 'application/json')
            .send(testJuniorRegister));
        testJuniorLogin = { phoneNumber: testJuniorRegister.phoneNumber, pin: pin.text };
    });

    afterAll(async () => {
        await connection.close();
        await app.close();
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
                const testData = { phoneNumber: '440234567896', pin: testJuniorLogin.pin } as LoginJuniorDto;
                return request(app.getHttpServer())
                    .post('/junior/login')
                    .send(testData)
                    .expect(400);
            }),
            it('returns Unauthorized if an invalid pin is provided', () => {
                const testData = { phoneNumber: testJuniorLogin.phoneNumber, pin: '12345' } as LoginJuniorDto;
                return request(app.getHttpServer())
                    .post('/junior/login')
                    .send(testData)
                    .expect(401);
            }),
            it('returns a Bad Request if invalid data is entered', () => {
                const testData = { phoneNumber: testJuniorLogin.phoneNumber };
                return request(app.getHttpServer())
                    .post('/junior/login')
                    .send(testData)
                    .expect(400);
            });
    });
});
