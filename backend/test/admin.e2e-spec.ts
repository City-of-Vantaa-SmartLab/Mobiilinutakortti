import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Connection } from 'typeorm';
import { RegisterAdminDto, LoginAdminDto, EditAdminDto } from '../src/admin/dto';
import { getTestDB } from './testdb';
import { AdminUserViewModel } from '../src/admin/vm/youthWorker.vm';
import { maximumAttempts } from '../src/authentication/authentication.consts';

describe('AdminController (e2e)', () => {
    let app;
    let connection: Connection;
    let superToken: string;
    let standardToken: string;
    let adminList: AdminUserViewModel[];

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
            .post('/api/admin/registerSuperAdmin')
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
                .send(testAdminRegister)
                .expect(201);
        }),
            it('returns a Conflict if the user already exists', async () => {
                return request(app.getHttpServer())
                    .post('/api/admin/register')
                    .set('Authorization', `Bearer ${superToken}`)
                    .set('Accept', 'application/json')
                    .send(testAdminRegister)
                    .expect(409);
            }),
            it('returns an Bad Request if invalid data is entered', () => {
                return request(app.getHttpServer())
                    .post('/api/admin/register')
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
                standardToken = (await request(app.getHttpServer())
                    .post('/api/admin/login')
                    .send(testAdminLogin)).body.access_token;
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
                .send(testAdminLogin)
                .expect('Content-Type', /json/)
                .expect(201).then(response => {
                    expect(response !== null);
                });
        }),
            it('returns a Bad Request if the email does not exist', () => {
                const testData = { email: 'boaty.mcboatface@gofore.com', password: testAdminLogin.password } as LoginAdminDto;
                return request(app.getHttpServer())
                    .post('/api/admin/login')
                    .send(testData)
                    .expect(400);
            }),
            it('returns Unauthorized if an invalid password is provided', () => {
                const testData = { email: testAdminLogin.email, password: 'wordswordswords' } as LoginAdminDto;
                return request(app.getHttpServer())
                    .post('/api/admin/login')
                    .send(testData)
                    .expect(401);
            }),
            it('returns a Bad Request if invalid data is entered', () => {
                const testData = { email: testAdminLogin.email };
                return request(app.getHttpServer())
                    .post('/api/admin/login')
                    .send(testData)
                    .expect(400);
            }),
            it('Should lockout a user if they make 5 incorrect attempts', async () => {
                const lockoutRegister = {
                    email: 'LockoutTest@test.com', password: 'Password',
                    firstName: 'Testy', lastName: 'McTestFace', isSuperUser: false,
                } as RegisterAdminDto;
                const lockoutLogin = { email: lockoutRegister.email, password: lockoutRegister.password } as LoginAdminDto;
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
        it('return a 200 if a valid Admin Token is provided', async () => {
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
        it('Should return a list containing details of all admins', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/admin/list')
                .set('Authorization', `Bearer ${superToken}`)
                .set('Accept', 'application/json');
            adminList = response.body as AdminUserViewModel[];
            return response.status === 200 && adminList.find(e => e.email === testAdminLogin.email.toLowerCase()) &&
                adminList.find(e => e.email === testAdminLogin.email.toLowerCase());
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
            const testData = { id: adminList[0].id, email: 'SuperCoolNewEmail@anEmail.com' } as EditAdminDto;
            return request(app.getHttpServer())
                .post('/api/admin/edit')
                .set('Authorization', `Bearer ${superToken}`)
                .set('Accept', 'application/json')
                .send(testData)
                .expect(201);
        }),
            it('Should reject non-super users', async () => {
                const testData = { id: adminList[0].id, email: 'SuperCoolNewEmail@anEmail.fi' } as EditAdminDto;
                return request(app.getHttpServer())
                    .post('/api/admin/edit')
                    .set('Authorization', `Bearer ${standardToken}`)
                    .set('Accept', 'application/json')
                    .send(testData)
                    .expect(403);
            }),
            it('Should throw an error if invalid data is provided.', async () => {
                const testData = { id: adminList[0].id, email: 'NotAnEmail' } as EditAdminDto;
                return request(app.getHttpServer())
                    .post('/api/admin/edit')
                    .set('Authorization', `Bearer ${superToken}`)
                    .set('Accept', 'application/json')
                    .send(testData)
                    .expect(400);
            }),
            it('Should throw an error if the user does not exist', async () => {
                const testData = { id: '014833', email: 'SuperCoolNewEmail@anEmail.com' } as EditAdminDto;
                return request(app.getHttpServer())
                    .post('/api/admin/edit')
                    .set('Authorization', `Bearer ${superToken}`)
                    .set('Accept', 'application/json')
                    .send(testData)
                    .expect(400);
            }),
            it('Should throw an error if the an email change is request, but the email is in use.', async () => {
                const testData = { id: adminList[1].id, email: 'SuperCoolNewEmail@anEmail.com' } as EditAdminDto;
                return request(app.getHttpServer())
                    .post('/api/admin/edit')
                    .set('Authorization', `Bearer ${superToken}`)
                    .set('Accept', 'application/json')
                    .send(testData)
                    .expect(409);
            }),
            it('Should throw an error if no data is changed.', async () => {
                const testData = { id: adminList[0].id } as EditAdminDto;
                return request(app.getHttpServer())
                    .post('/api/admin/edit')
                    .set('Authorization', `Bearer ${superToken}`)
                    .set('Accept', 'application/json')
                    .send(testData)
                    .expect(400);
            });
    });

    describe('/admin/delete', () => {
        let adminToDelete;
        beforeAll(async () => {
            const newAdminToDelete = {
                email: 'delete@me.com', password: 'pwordsprhg',
                firstName: 'qegqegqeg', lastName: 'paejq', isSuperUser: false,
            } as RegisterAdminDto;
            await request(app.getHttpServer())
                .post('/api/admin/registerSuperAdmin')
                .send(newAdminToDelete);
            const response = (await request(app.getHttpServer())
                .get('/api/admin/list')
                .set('Authorization', `Bearer ${superToken}`)
                .set('Accept', 'application/json')).body as AdminUserViewModel[];
            adminToDelete = response.find(i => i.email === newAdminToDelete.email).id;
        }),
            it('Should return a 200 user when carried out by a SuperAdmin', async () => {
                return request(app.getHttpServer())
                    .delete(`/api/admin/${adminToDelete}`)
                    .set('Authorization', `Bearer ${superToken}`)
                    .set('Accept', 'application/json')
                    .expect(200);
            }),
            it('Should reject the request for non-admins', () => {
                return request(app.getHttpServer())
                    .delete(`/api/admin/${adminToDelete}`)
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
