import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Connection } from 'typeorm';
import { RegisterYouthWorkerDto, LoginYouthWorkerDto, EditYouthWorkerDto } from '../src/admin/dto';
import { getTestDB } from './testdb';
import { YouthWorkerUserViewModel } from '../src/admin/vm/admin.vm';
import { maximumAttempts } from '../src/authentication/authentication.consts';

describe('YouthWorkerController (e2e)', () => {
    let app;
    let connection: Connection;
    let superToken: string;
    let standardToken: string;
    let youthWorkerList: YouthWorkerUserViewModel[];

    const testSuperRegister = {
        email: 'anEmail@gofore.com', password: 'Password',
        firstName: 'Testy', lastName: 'McTestFace', isAdmin: true,
    } as RegisterYouthWorkerDto;

    const testSuperLogin = {
        email: testSuperRegister.email, password: testSuperRegister.password,
    } as LoginYouthWorkerDto;

    const testYouthWorkerRegister = {
        email: 'Testy.McTestFace@gofore.com', password: 'Password',
        firstName: 'Testy', lastName: 'McTestFace', isAdmin: false,
    } as RegisterYouthWorkerDto;

    const testYouthWorkerLogin = {
        email: testYouthWorkerRegister.email, password: testYouthWorkerRegister.password,
    } as LoginYouthWorkerDto;

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
            .post('/api/admin/registerAdmin')
            .send(testSuperRegister);
        superToken = (await request(app.getHttpServer())
            .post('/api/admin/login')
            .send(testSuperLogin)).body.access_token;
    });

    afterAll(async () => {
        await connection.close();
        await app.close();
    });

    describe('/admin/register', () => {
        it('returns a Created if a new user is created', async () => {
            return request(app.getHttpServer())
                .post('/api/admin/register')
                .set('Authorization', `Bearer ${superToken}`)
                .set('Accept', 'application/json')
                .send(testYouthWorkerRegister)
                .expect(201);
        }),
            it('returns a Conflict if the user already exists', async () => {
                return request(app.getHttpServer())
                    .post('/api/admin/register')
                    .set('Authorization', `Bearer ${superToken}`)
                    .set('Accept', 'application/json')
                    .send(testYouthWorkerRegister)
                    .expect(409);
            }),
            it('returns an Bad Request if invalid data is entered', () => {
                return request(app.getHttpServer())
                    .post('/api/admin/register')
                    .set('Authorization', `Bearer ${superToken}`)
                    .set('Accept', 'application/json')
                    .send(testYouthWorkerLogin)
                    .expect(400);
            }),
            it('should reject an attempt from non-super users', async () => {
                const testData = {
                    email: 'another@test.com',
                    firstName: testYouthWorkerRegister.firstName,
                    lastName: testYouthWorkerRegister.lastName,
                    password: testYouthWorkerRegister.password, isAdmin: false,
                } as RegisterYouthWorkerDto;
                standardToken = (await request(app.getHttpServer())
                    .post('/api/admin/login')
                    .send(testYouthWorkerLogin)).body.access_token;
                return request(app.getHttpServer())
                    .post('/api/admin/register')
                    .set('Authorization', `Bearer ${standardToken}`)
                    .set('Accept', 'application/json')
                    .send(testData)
                    .expect(403);
            });
    });

    describe('/admin/login (POST)', () => {
        it('returns a JWT token on a succesful login', () => {
            return request(app.getHttpServer())
                .post('/api/admin/login')
                .send(testYouthWorkerLogin)
                .expect('Content-Type', /json/)
                .expect(201).then(response => {
                    expect(response !== null);
                });
        }),
            it('returns a Bad Request if the email does not exist', () => {
                const testData = { email: 'boaty.mcboatface@gofore.com', password: testYouthWorkerLogin.password } as LoginYouthWorkerDto;
                return request(app.getHttpServer())
                    .post('/api/admin/login')
                    .send(testData)
                    .expect(400);
            }),
            it('returns Unauthorized if an invalid password is provided', () => {
                const testData = { email: testYouthWorkerLogin.email, password: 'wordswordswords' } as LoginYouthWorkerDto;
                return request(app.getHttpServer())
                    .post('/api/admin/login')
                    .send(testData)
                    .expect(401);
            }),
            it('returns a Bad Request if invalid data is entered', () => {
                const testData = { email: testYouthWorkerLogin.email };
                return request(app.getHttpServer())
                    .post('/api/admin/login')
                    .send(testData)
                    .expect(400);
            }),
            it('Should lockout a user if they make 5 incorrect attempts', async () => {
                const lockoutRegister = {
                    email: 'LockoutTest@test.com', password: 'Password',
                    firstName: 'Testy', lastName: 'McTestFace', isAdmin: false,
                } as RegisterYouthWorkerDto;
                const lockoutLogin = { email: lockoutRegister.email, password: lockoutRegister.password } as LoginYouthWorkerDto;
                const lockoutLoginWrong = { email: lockoutRegister.email, password: '12345' };
                await request(app.getHttpServer())
                    .post('/api/admin/register')
                    .set('Authorization', `Bearer ${superToken}`)
                    .set('Accept', 'application/json')
                    .send(lockoutRegister);
                for (let i = 0; i < maximumAttempts; i++) {
                    await request(app.getHttpServer())
                        .post('/api/admin/login')
                        .send(lockoutLoginWrong);
                }
                return request(app.getHttpServer())
                    .post('/api/admin/login')
                    .send(lockoutLogin)
                    .expect(403);
            });
    });

    describe('/admin/login (Get)', () => {
        it('return a 200 if a valid (admin) user Token is provided', async () => {
            return request(app.getHttpServer())
                .get('/api/admin/login')
                .set('Authorization', `Bearer ${standardToken}`)
                .set('Accept', 'application/json')
                .expect(200);
        }),
            it('returns an error in the case of an invalid token is provided', async () => {
                return request(app.getHttpServer())
                    .get('/api/admin/login')
                    .set('Authorization', `Bearer ${standardToken}1`)
                    .set('Accept', 'application/json')
                    .expect(401);
            });
    });

    describe('/admin/list', () => {
        it('Should return a list containing details of all youth workers', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/admin/list')
                .set('Authorization', `Bearer ${superToken}`)
                .set('Accept', 'application/json');
            youthWorkerList = response.body as YouthWorkerUserViewModel[];
            return response.status === 200 && youthWorkerList.find(e => e.email === testYouthWorkerLogin.email.toLowerCase()) &&
                youthWorkerList.find(e => e.email === testYouthWorkerLogin.email.toLowerCase());
        }),
            it('Should reject non-super users', async () => {
                return request(app.getHttpServer())
                    .get('/api/admin/list')
                    .set('Authorization', `Bearer ${standardToken}`)
                    .set('Accept', 'application/json')
                    .expect(403);
            });
    });

    describe('/admin/edit', () => {
        it('Should return a 201 when completed with valid data', async () => {
            const testData = { id: youthWorkerList[0].id, email: 'SuperCoolNewEmail@anEmail.com' } as EditYouthWorkerDto;
            return request(app.getHttpServer())
                .post('/api/admin/edit')
                .set('Authorization', `Bearer ${superToken}`)
                .set('Accept', 'application/json')
                .send(testData)
                .expect(201);
        }),
            it('Should reject non-super users', async () => {
                const testData = { id: youthWorkerList[0].id, email: 'SuperCoolNewEmail@anEmail.fi' } as EditYouthWorkerDto;
                return request(app.getHttpServer())
                    .post('/api/admin/edit')
                    .set('Authorization', `Bearer ${standardToken}`)
                    .set('Accept', 'application/json')
                    .send(testData)
                    .expect(403);
            }),
            it('Should throw an error if invalid data is provided.', async () => {
                const testData = { id: youthWorkerList[0].id, email: 'NotAnEmail' } as EditYouthWorkerDto;
                return request(app.getHttpServer())
                    .post('/api/admin/edit')
                    .set('Authorization', `Bearer ${superToken}`)
                    .set('Accept', 'application/json')
                    .send(testData)
                    .expect(400);
            }),
            it('Should throw an error if the user does not exist', async () => {
                const testData = { id: '014833', email: 'SuperCoolNewEmail@anEmail.com' } as EditYouthWorkerDto;
                return request(app.getHttpServer())
                    .post('/api/admin/edit')
                    .set('Authorization', `Bearer ${superToken}`)
                    .set('Accept', 'application/json')
                    .send(testData)
                    .expect(400);
            }),
            it('Should throw an error if the an email change is request, but the email is in use.', async () => {
                const testData = { id: youthWorkerList[1].id, email: 'SuperCoolNewEmail@anEmail.com' } as EditYouthWorkerDto;
                return request(app.getHttpServer())
                    .post('/api/admin/edit')
                    .set('Authorization', `Bearer ${superToken}`)
                    .set('Accept', 'application/json')
                    .send(testData)
                    .expect(409);
            }),
            it('Should throw an error if no data is changed.', async () => {
                const testData = { id: youthWorkerList[0].id } as EditYouthWorkerDto;
                return request(app.getHttpServer())
                    .post('/api/admin/edit')
                    .set('Authorization', `Bearer ${superToken}`)
                    .set('Accept', 'application/json')
                    .send(testData)
                    .expect(400);
            });
    });

    describe('/admin/delete', () => {
        let youthWorkerToDelete;
        beforeAll(async () => {
            const newYouthWorkerToDelete = {
                email: 'delete@me.com', password: 'pwordsprhg',
                firstName: 'qegqegqeg', lastName: 'paejq', isAdmin: false,
            } as RegisterYouthWorkerDto;
            await request(app.getHttpServer())
                .post('/api/admin/registerAdmin')
                .send(newYouthWorkerToDelete);
            const response = (await request(app.getHttpServer())
                .get('/api/admin/list')
                .set('Authorization', `Bearer ${superToken}`)
                .set('Accept', 'application/json')).body as YouthWorkerUserViewModel[];
            youthWorkerToDelete = response.find(i => i.email === newYouthWorkerToDelete?.email).id;
        }),
            it('Should return a 200 user when carried out by a SuperAdmin', async () => {
                return request(app.getHttpServer())
                    .delete(`/api/admin/${youthWorkerToDelete}`)
                    .set('Authorization', `Bearer ${superToken}`)
                    .set('Accept', 'application/json')
                    .expect(200);
            }),
            it('Should reject the request for non-youth workers', () => {
                return request(app.getHttpServer())
                    .delete(`/api/admin/${youthWorkerToDelete}`)
                    .set('Authorization', `Bearer ${standardToken}`)
                    .set('Accept', 'application/json')
                    .expect(403);
            }),
            it('Should reject the reqest if the ID is invalid', () => {
                return request(app.getHttpServer())
                    .delete(`/api/admin/183461394613`)
                    .set('Authorization', `Bearer ${superToken}`)
                    .set('Accept', 'application/json')
                    .expect(400);
            });
    });
});
