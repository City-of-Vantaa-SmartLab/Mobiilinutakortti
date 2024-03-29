import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Connection } from 'typeorm';
import { RegisterYouthWorkerDto, LoginYouthWorkerDto } from '../src/youthWorker/dto';
import { getTestDB } from './testdb';
import { RegisterJuniorDto, LoginJuniorDto, EditJuniorDto, ResetJuniorDto } from '../src/junior/dto';
import { JuniorUserViewModel } from '../src/junior/vm';

describe('JuniorController (e2e)', () => {
    let app;
    let connection: Connection;
    let token: string;
    let juniorToken: string;
    let juniorList: JuniorUserViewModel[];

    const testYouthWorkerRegister = {
        email: 'Testy.McTempFace@gofore.com', password: 'Password',
        firstName: 'Testy', lastName: 'McTestFace', isAdmin: true,
    } as RegisterYouthWorkerDto;

    const testJuniorRegister = {
        phoneNumber: '04122345671',
        firstName: 'Testy jr the second', lastName: 'e2e2',
        postCode: '02130',
        parentsName: 'Auth Senior',
        parentsPhoneNumber: '0411234567',
        gender: 'M',
        birthday: new Date().toISOString(),
        homeYouthClub: 'Tikkurila',
    } as RegisterJuniorDto;

    const testYouthWorkerLogin = {
        email: testYouthWorkerRegister.email, password: testYouthWorkerRegister.password,
    } as LoginYouthWorkerDto;

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
            .post('/api/admin/registerAdmin')
            .send(testYouthWorkerRegister);
        token = (await request(app.getHttpServer())
            .post('/api/admin/login')
            .send(testYouthWorkerLogin)).body.access_token;
        const a = await request(app.getHttpServer())
            .post('/api/junior/register')
            .set('Authorization', `Bearer ${token}`)
            .set('Accept', 'application/json')
            .send(testJuniorRegister);

        const challenge = (await request(app.getHttpServer())
            .get(`/api/junior/getChallenge/${testJuniorRegister.phoneNumber}`)
            .set('Accept', 'application/json')).body;
        testJuniorLogin = { id: challenge.id, challenge: challenge.challenge };
    });

    afterAll(async () => {
        await connection.close();
        await app.close();
    });

    describe('/junior/register', () => {
        it('returns a 201 if a new user is created', async () => {
            const testData = {
                phoneNumber: '04112345677',
                firstName: testJuniorRegister.firstName, lastName: testJuniorRegister.lastName,
                birthday: new Date().toISOString(), homeYouthClub: 'TestTown', postCode: '09814', parentsName: testJuniorRegister.parentsName,
                parentsPhoneNumber: testJuniorRegister.parentsPhoneNumber, gender: 'f',
            } as RegisterJuniorDto;
            return request(app.getHttpServer())
                .post('/api/junior/register')
                .set('Authorization', `Bearer ${token}`)
                .set('Accept', 'application/json')
                .send(testData)
                .expect(201);
        }),
            it('returns a Conflict if the user already exists', async () => {
                return request(app.getHttpServer())
                    .post('/api/junior/register')
                    .set('Authorization', `Bearer ${token}`)
                    .set('Accept', 'application/json')
                    .send(testJuniorRegister)
                    .expect(409);
            }),
            it('returns an Bad Request if invalid data is entered', async () => {
                const testData = { firstName: 'Bob', lastName: 'Bobby' };
                return request(app.getHttpServer())
                    .post('/api/junior/register')
                    .set('Authorization', `Bearer ${token}`)
                    .set('Accept', 'application/json')
                    .send(testData)
                    .expect(400);
            }),
            it('returns an Unauthorized if no JWT token is provided', async () => {
                return request(app.getHttpServer())
                    .post('/api/junior/register')
                    .send(testJuniorRegister)
                    .expect(401);
            });
    });

    describe('/junior/login POST', () => {
        it('returns a JWT token on a succesful login', async () => {
            juniorToken = (await request(app.getHttpServer())
                .post('/api/junior/login')
                .send(testJuniorLogin)).body.access_token;
            expect(juniorToken);
        }),
            it('returns an unauthorized if the id does not exist', async () => {
                const testData = { id: '1', challenge: testJuniorLogin.challenge } as LoginJuniorDto;
                return request(app.getHttpServer())
                    .post('/api/junior/login')
                    .send(testData)
                    .expect(401);
            }),
            it('returns exception if an invalid challenge is provided', async () => {
                const testData = { id: testJuniorLogin.id, challenge: '12345' } as LoginJuniorDto;
                return request(app.getHttpServer())
                    .post('/api/junior/login')
                    .send(testData)
                    .expect(401);
            }),
            it('returns a Bad Request if invalid data is entered', async () => {
                const testData = { phoneNumber: testJuniorLogin.id };
                return request(app.getHttpServer())
                    .post('/api/junior/login')
                    .send(testData)
                    .expect(400);
            });
    });

    describe('/junior/login GET', () => {
        it('return a 200 if a valid junior Token is provided', async () => {
            return request(app.getHttpServer())
                .get('/api/junior/login')
                .set('Authorization', `Bearer ${juniorToken}`)
                .set('Accept', 'application/json')
                .expect(200);
        }),
            it('returns an error in the case of an invalid token is provided', async () => {
                return request(app.getHttpServer())
                    .get('/api/junior/login')
                    .set('Authorization', `Bearer ${token}`)
                    .set('Accept', 'application/json')
                    .expect(403);
            });
    });

    describe('/junior/list', () => {
        it('Should return a list containing details of all juniors', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/junior/list')
                .set('Authorization', `Bearer ${token}`)
                .set('Accept', 'application/json');
            juniorList = response.body as JuniorUserViewModel[];
            return response.status === 200 && juniorList.find(e => e.phoneNumber === testJuniorRegister.phoneNumber);
        }),
            it('Should reject non-super users', async () => {
                return request(app.getHttpServer())
                    .get('/api/admin/list')
                    .set('Authorization', `Bearer ${juniorToken}`)
                    .set('Accept', 'application/json')
                    .expect(403);
            });
    });

    describe('/junior/edit', () => {
        it('Should return a 201 when completed with valid data', async () => {
            const testData = { id: juniorList[0].id, firstName: 'John' } as EditJuniorDto;
            return request(app.getHttpServer())
                .post('/api/junior/edit')
                .set('Authorization', `Bearer ${token}`)
                .set('Accept', 'application/json')
                .send(testData)
                .expect(201);
        }),
            it('Should reject non-super users', async () => {
                const testData = { id: juniorList[0].id, phoneNumber: '04122345671' } as EditJuniorDto;
                return request(app.getHttpServer())
                    .post('/api/junior/edit')
                    .set('Authorization', `Bearer ${juniorToken}`)
                    .set('Accept', 'application/json')
                    .send(testData)
                    .expect(403);
            }),
            it('Should throw an error if invalid data is provided.', async () => {
                const testData = { id: juniorList[0].id, phoneNumber: 'notAPhoneNumber' } as EditJuniorDto;
                return request(app.getHttpServer())
                    .post('/api/junior/edit')
                    .set('Authorization', `Bearer ${token}`)
                    .set('Accept', 'application/json')
                    .send(testData)
                    .expect(400);
            }),
            it('Should throw an error if the user does not exist', async () => {
                const testData = { id: '014833', phoneNumber: '04112345671' } as EditJuniorDto;
                return request(app.getHttpServer())
                    .post('/api/junior/edit')
                    .set('Authorization', `Bearer ${token}`)
                    .set('Accept', 'application/json')
                    .send(testData)
                    .expect(400);
            }),
            it('Should throw an error if the a number change is request, but the number is in use.', async () => {
                const temp = {
                    phoneNumber: '04112340677',
                    firstName: testJuniorRegister.firstName, lastName: testJuniorRegister.lastName,
                } as RegisterJuniorDto;
                await request(app.getHttpServer())
                    .post('/api/junior/register')
                    .set('Authorization', `Bearer ${token}`)
                    .set('Accept', 'application/json')
                    .send(temp);
                const testData = { id: juniorList[0].id, phoneNumber: juniorList[1].phoneNumber } as EditJuniorDto;
                return request(app.getHttpServer())
                    .post('/api/junior/edit')
                    .set('Authorization', `Bearer ${token}`)
                    .set('Accept', 'application/json')
                    .send(testData)
                    .expect(409);
            }),
            it('Should throw an error if no data is changed.', async () => {
                const testData = { id: juniorList[0].id } as EditJuniorDto;
                return request(app.getHttpServer())
                    .post('/api/junior/edit')
                    .set('Authorization', `Bearer ${token}`)
                    .set('Accept', 'application/json')
                    .send(testData)
                    .expect(400);
            });
    });

    describe('/junior/reset', () => {
        it('Should return a 200 when completed with a new challenge', async () => {
            const testData = { phoneNumber: testJuniorRegister.phoneNumber } as ResetJuniorDto;
            return request(app.getHttpServer())
                .post('/api/junior/reset')
                .set('Authorization', `Bearer ${token}`)
                .set('Accept', 'application/json')
                .send(testData)
                .expect(201);
        });
    });

    describe('/junior/delete', () => {
        let juniorToDelete;
        beforeAll(async () => {
            const response = await request(app.getHttpServer())
                .get('/api/junior/list')
                .set('Authorization', `Bearer ${token}`)
                .set('Accept', 'application/json');
            juniorToDelete = response.body[0].id;
        }),
            it('Should return a 200 user when carried out by a youth worker', async () => {
                return request(app.getHttpServer())
                    .delete(`/api/junior/${juniorToDelete}`)
                    .set('Authorization', `Bearer ${token}`)
                    .set('Accept', 'application/json')
                    .expect(200);
            }),
            it('Should reject the request for non-youth workers', () => {
                return request(app.getHttpServer())
                    .delete(`/api/junior/${juniorToDelete}`)
                    .set('Authorization', `Bearer ${juniorToken}`)
                    .set('Accept', 'application/json')
                    .expect(403);
            }),
            it('Should reject the reqest if the ID is invalid', () => {
                return request(app.getHttpServer())
                    .delete(`/api/junior/183461394613`)
                    .set('Authorization', `Bearer ${token}`)
                    .set('Accept', 'application/json')
                    .expect(400);
            });
    });
});
