import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Connection } from 'typeorm';
import { RegisterAdminDto, LoginAdminDto } from '../src/admin/dto';
import { getTestDB } from './testdb';

describe('AdminController (e2e)', () => {
    let app;
    let connection: Connection;
    let superToken: string;

    const testSuperRegister = {
        email: 'anEmail@gofore.com', password: 'Password',
        firstName: 'Testy', lastName: 'McTestFace', isSuperUser: true,
    } as RegisterAdminDto;

    const testSuperLogin = {
        email: testSuperRegister.email, password: testSuperRegister.password,
    } as LoginAdminDto;

    const testAdminRegister = {
        email: 'Testy.McTestFace@gofore.com', password: 'Password',
        firstName: 'Testy', lastName: 'McTestFace', isSuperUser: false,
    } as RegisterAdminDto;

    const testAdminLogin = {
        email: testAdminRegister.email, password: testAdminRegister.password,
    } as LoginAdminDto;

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
            .send(testSuperRegister);
        superToken = (await request(app.getHttpServer())
            .post('/admin/login')
            .send(testSuperLogin)).body.access_token;
    });

    afterAll(async () => {
        await connection.close();
        await app.close();
    });

    describe('/admin/register', () => {
        it('returns a Created if a new user is created', async () => {
            return request(app.getHttpServer())
                .post('/admin/register')
                .set('Authorization', `Bearer ${superToken}`)
                .set('Accept', 'application/json')
                .send(testAdminRegister)
                .expect(201);
        }),
            it('returns a Conflict if the user already exists', async () => {
                return request(app.getHttpServer())
                    .post('/admin/register')
                    .set('Authorization', `Bearer ${superToken}`)
                    .set('Accept', 'application/json')
                    .send(testAdminRegister)
                    .expect(409);
            }),
            it('returns an Bad Request if invalid data is entered', () => {
                return request(app.getHttpServer())
                    .post('/admin/register')
                    .set('Authorization', `Bearer ${superToken}`)
                    .set('Accept', 'application/json')
                    .send(testAdminLogin)
                    .expect(400);
            }),
            it('should reject an attempt from non-super users', async () => {
                const testData = {
                    email: 'another@test.com',
                    firstName: testAdminRegister.firstName,
                    lastName: testAdminRegister.lastName,
                    password: testAdminRegister.password, isSuperUser: false,
                } as RegisterAdminDto;
                const token = (await request(app.getHttpServer())
                    .post('/admin/login')
                    .send(testAdminLogin)).body.access_token;
                return request(app.getHttpServer())
                    .post('/admin/register')
                    .set('Authorization', `Bearer ${token}`)
                    .set('Accept', 'application/json')
                    .send(testData)
                    .expect(403);
            });
    });

    describe('/admin/login', () => {
        it('returns a JWT token on a succesful login', () => {
            return request(app.getHttpServer())
                .post('/admin/login')
                .send(testAdminLogin)
                .expect('Content-Type', /json/)
                .expect(201).then(response => {
                    expect(response !== null);
                });
        }),
            it('returns a Bad Request if the email does not exist', () => {
                const testData = { email: 'boaty.mcboatface@gofore.com', password: testAdminLogin.password } as LoginAdminDto;
                return request(app.getHttpServer())
                    .post('/admin/login')
                    .send(testData)
                    .expect(400);
            }),
            it('returns Unauthorized if an invalid password is provided', () => {
                const testData = { email: testAdminLogin.email, password: 'wordswordswords' } as LoginAdminDto;
                return request(app.getHttpServer())
                    .post('/admin/login')
                    .send(testData)
                    .expect(401);
            }),
            it('returns a Bad Request if invalid data is entered', () => {
                const testData = { email: testAdminLogin.email };
                return request(app.getHttpServer())
                    .post('/admin/login')
                    .send(testData)
                    .expect(400);
            });
    });
});
