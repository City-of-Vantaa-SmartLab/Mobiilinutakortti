import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Connection } from 'typeorm';
import { RegisterAdminDto, LoginAdminDto } from '../src/admin/dto';
import { getTestDB } from './testdb';
import { RegisterJuniorDto, LoginJuniorDto, EditJuniorDto, ResetJuniorDto } from '../src/junior/dto';
import { JuniorUserViewModel } from '../src/junior/vm';
import { ClubViewModel } from '../src/club/vm';
import { CheckInDto } from 'src/club/dto';
import { Check } from 'src/common/vm';
import { CheckIn } from 'src/club/entities';

describe('JuniorController (e2e)', () => {
    let app;
    let connection: Connection;
    let token: string;
    let juniorToken: string;
    let juniorList: JuniorUserViewModel[];
    let clubList: ClubViewModel[];

    const testAdminRegister = {
        email: 'SuperTester@gofore.com', password: 'Password',
        firstName: 'Testy', lastName: 'McTestFace', isSuperUser: true,
    } as RegisterAdminDto;

    const testJuniorRegister = {
        phoneNumber: '04122348888',
        firstName: 'Clubber', lastName: 'e2e2',
        postCode: '02130',
        parentsName: 'Auth Senior',
        parentsPhoneNumber: '0411234567',
        gender: 'M',
        age: 10,
        homeYouthClub: 'Tikkurila',
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
        await request(app.getHttpServer())
            .post('/junior/register')
            .set('Authorization', `Bearer ${token}`)
            .set('Accept', 'application/json')
            .send(testJuniorRegister);
        const challenge = (await request(app.getHttpServer())
            .get(`/junior/getChallenge/${testJuniorRegister.phoneNumber}`)
            .set('Accept', 'application/json')).body;
        testJuniorLogin = { id: challenge.id, challenge: challenge.challenge };
        juniorList = (await request(app.getHttpServer())
            .get('/junior/list')
            .set('Authorization', `Bearer ${token}`)
            .set('Accept', 'application/json')).body as JuniorUserViewModel[];
        juniorToken = (await request(app.getHttpServer())
            .post('/junior/login')
            .send(testJuniorLogin)).body.access_token;
        clubList = (await request(app.getHttpServer())
            .get('/club/list')
            .set('Authorization', `Bearer ${token}`)
            .set('Accept', 'application/json')
        ).body;
    });

    afterAll(async () => {
        await connection.close();
        await app.close();
    });

    describe('/club/list', () => {
        it('Should return a list containing details of all clubs', async () => {
            const exampleClub = clubList[0];
            const response = await request(app.getHttpServer())
                .get('/club/list')
                .set('Authorization', `Bearer ${token}`)
                .set('Accept', 'application/json');
            const returnedList = response.body as ClubViewModel[];
            return response.status === 200 && returnedList.find(e => e.name === exampleClub.name);
        }),
            it('Should reject non admins', async () => {
                return request(app.getHttpServer())
                    .get('/club/list')
                    .set('Authorization', `Bearer ${juniorToken}`)
                    .set('Accept', 'application/json')
                    .expect(403);
            });
    });

    describe('/club/check-in (POST)', () => {
        it('should return a 201 and true if the check-in is successful', async () => {
            const exampleCheckIn = { clubId: clubList[0].id, juniorId: juniorList[0].id } as CheckInDto;
            const response = (await request(app.getHttpServer())
                .post('/club/check-in')
                .set('Authorization', `Bearer ${token}`)
                .set('Accept', 'application/json')
                .send(exampleCheckIn));
            const checkResult = response.body as Check;
            expect(response.status === 201 && checkResult.result);
        }),
            it('should reject non-admins', async () => {
                const exampleCheckIn = { clubId: clubList[0].id, juniorId: juniorList[0].id } as CheckInDto;
                const response = (await request(app.getHttpServer())
                    .post('/club/check-in')
                    .set('Authorization', `Bearer ${juniorToken}`)
                    .set('Accept', 'application/json')
                    .send(exampleCheckIn));
                expect(response.status === 403);
            }),
            it('should throw a Bad Request if the junior does not exists', async () => {
                const exampleCheckIn = { clubId: clubList[0].id, juniorId: '99999999' } as CheckInDto;
                const response = (await request(app.getHttpServer())
                    .post('/club/check-in')
                    .set('Authorization', `Bearer ${token}`)
                    .set('Accept', 'application/json')
                    .send(exampleCheckIn));
                expect(response.status === 400);
            }),
            it('should return a Bad Request if the club does not exist', async () => {
                const exampleCheckIn = { clubId: '999999', juniorId: juniorList[0].id } as CheckInDto;
                const response = (await request(app.getHttpServer())
                    .post('/club/check-in')
                    .set('Authorization', `Bearer ${token}`)
                    .set('Accept', 'application/json')
                    .send(exampleCheckIn));
                expect(response.status === 400);
            });
    });

    describe('/club/check-in/:id', () => {
        beforeAll(async () => {
            const exampleCheckIn = { clubId: clubList[0].id, juniorId: juniorList[0].id } as CheckInDto;
            await request(app.getHttpServer())
                .post('/club/check-in')
                .set('Authorization', `Bearer ${token}`)
                .set('Accept', 'application/json')
                .send(exampleCheckIn);
        }),
            it('Should return all check-ins for the provided club', async () => {
                const response = (await request(app.getHttpServer())
                    .get(`/club/check-in/${clubList[0].id}`)
                    .set('Authorization', `Bearer ${token}`)
                    .set('Accept', 'application/json'));
                const checkIns = response.body as CheckIn[];
                expect(response.status === 200 && checkIns.length > 0);
            }),
            it('Should reject the user if they are not an admin.', async () => {
                await request(app.getHttpServer())
                    .get(`/club/check-in/${clubList[0].id}`)
                    .set('Authorization', `Bearer ${juniorToken}`)
                    .set('Accept', 'application/json')
                    .expect(403);
            }),
            it('Should return a bad request if an invalid club is provided', async () => {
                await request(app.getHttpServer())
                    .get(`/club/check-in/99999999`)
                    .set('Authorization', `Bearer ${token}`)
                    .set('Accept', 'application/json')
                    .expect(400);
            });
    });
});
