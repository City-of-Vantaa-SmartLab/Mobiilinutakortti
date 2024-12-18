import { Injectable, Logger } from '@nestjs/common';
import { Club } from '../club/entities';
import { Junior } from '../junior/entities';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig } from 'axios';
import { map, lastValueFrom } from 'rxjs';
import { Activity, CheckInRequestBody } from './classes';
import { calculateAge, isBetween } from '../common/helpers';
import statisticsAgeGroups from '../common/statisticsAgeGroups';
import genderMapping, { Gender } from '../common/genderMapping';

@Injectable()
export class KompassiService {

    private static readonly _kompassiApiKey = process.env.KOMPASSI_API_KEY;
    private static readonly _kompassiApiUrl = process.env.KOMPASSI_API_URL;

    private static readonly _logger = new Logger('Kompassi Service');

    constructor(
        private readonly httpService: HttpService
    ) { }

    async updateKompassiData(junior: Junior, club: Club) {
        if (!KompassiService._kompassiApiUrl ||
            !KompassiService._kompassiApiKey ||
            !club.kompassiIntegration?.enabled ||
            !club.kompassiIntegration?.organisationId ||
            !club.kompassiIntegration?.groupId) return;

        try {
            const activity = await this.getActivityForToday(club);
            const activityId = activity ? activity.activityId : await this.createActivityForToday(club);
            const ageGroupId = KompassiService.getAgeGroupId(junior);
            const genderId = KompassiService.getGenderId(junior);
            this.checkInForActivity({ activityId, ageGroupId, genderId });
        } catch (e) {
            KompassiService._logger.error('Error during Kompassi integration: ' + e)
        }
    }

    private async getActivityForToday(club: Club): Promise<Activity> {
        KompassiService._logger.debug("Get activity for club: " + club.name);
        const now = new Date();
        const dateString = now.getFullYear + '-' + ('0' + (now.getMonth() + 1)).slice(-2) + '-' + ('0' + now.getDate()).slice(-2);

        const requestConfig: AxiosRequestConfig = {
            method: 'GET',
            url: `${KompassiService._kompassiApiUrl}/activities/findByOrganisation?organisationId=${club.kompassiIntegration.organisationId}&startAt=${dateString}`,
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': KompassiService._kompassiApiKey
            }
        };

        const request = this.httpService
            .get(requestConfig.url, requestConfig)
            .pipe(map((response) => response.data));
        return (await lastValueFrom(request))
            .filter((activity: Activity) => {
                activity.groupId === club.kompassiIntegration.groupId &&
                activity.activityTitle === KompassiService.getActivityTitle(club, now)
            });
    }

    private async createActivityForToday(club: Club): Promise<number> {
        KompassiService._logger.log("Create activity for club: " + club.name);
        const now = new Date();
        const dateString = now.getFullYear + '-' + ('0' + (now.getMonth() + 1)).slice(-2) + '-' + ('0' + now.getDate()).slice(-2);
        const timeString = ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2) + ':00.000000 +00:00';

        const requestConfig: AxiosRequestConfig = {
            method: 'POST',
            url: KompassiService._kompassiApiUrl + '/activities',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': KompassiService._kompassiApiKey
            },
            data: JSON.stringify({
                groupId: club.kompassiIntegration.groupId,
                title: KompassiService.getActivityTitle(club, now),
                startAt: `${dateString} ${timeString}`,
                endAt: `${dateString} 23:00:00.000000 +00:00`,
                activityTypeIds: KompassiService.getActivityTypeIds(club)
            })
        };

        const request = this.httpService
            .post(requestConfig.url, requestConfig)
            .pipe(map((response) => response.data));
        const { id } = (await lastValueFrom(request));
        return id;
    }

    private async checkInForActivity(body: CheckInRequestBody) {
        KompassiService._logger.log("Check-in for activity: " + body.activityId);

        const requestConfig: AxiosRequestConfig = {
            method: 'POST',
            url: KompassiService._kompassiApiUrl + '/check-in',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': KompassiService._kompassiApiKey
            },
            data: JSON.stringify(body)
        };

        this.httpService.post(requestConfig.url, requestConfig);
    }

    private static getGenderId(junior: Junior): number {
        const gender: Gender = Gender[junior.gender];
        const genderId = genderMapping.find(m => m.nutakortti === gender)?.kompassiGenderId ?? 0;
        if (genderId > 0) return genderId;
        throw new Error("Unknown gender.");
    }

    private static getAgeGroupId(junior: Junior): number {
        const age = calculateAge(junior.birthday);
        statisticsAgeGroups.forEach(ag => {
            const [min, max] = ag.range.split('-');
            if (isBetween(age, +min, +max)) return ag.kompassiId;
        });
        throw new Error("Invalid age: " + age);
    }

    /*
     * Activity title is used to match found activities to find the auto-generated one.
     */
    private static getActivityTitle(club: Club, date: Date): string {
        const dateString = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
        return club.kompassiIntegration?.activityTitle ?
            `${club.kompassiIntegration.activityTitle} ${dateString}` :
            dateString;
    }

    private static getActivityTypeIds(club: Club): number[] {
        const activityTypeIds = club.kompassiIntegration?.activityTypeIds?.replace(/\s/g, '').split(',').map(Number);
        return activityTypeIds ? activityTypeIds : [];
    }
}
