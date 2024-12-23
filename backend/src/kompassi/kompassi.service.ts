import { Injectable, Logger } from '@nestjs/common';
import { Club } from '../club/entities';
import { Junior } from '../junior/entities';
import { HttpService } from '@nestjs/axios';
import { map, lastValueFrom } from 'rxjs';
import { Activity, CheckInRequestBody, Group } from './classes';
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
            !club.kompassiIntegration?.groupId) return;

        try {
            const activity = await this.getActivityForToday(club);
            const activityId = activity ? activity.activityId : await this.createActivityForToday(club);
            const ageGroupId = KompassiService.getAgeGroupId(junior);
            const genderId = KompassiService.getGenderId(junior);
            this.checkInForActivity({ activityId, ageGroupId, genderId });
        } catch (e) {
            KompassiService._logger.error('Error during Kompassi integration: ' + e);
        }
    }

    private async getActivityForToday(club: Club): Promise<Activity> {
        KompassiService._logger.debug("Get activity for club: " + club.name);

        // Get the group to get the organisation id to get the activities.
        // NB: this could be optimized by caching the organisation id if speed seems sluggish in practice.
        const group = await this.getGroup(club.kompassiIntegration.groupId);
        KompassiService._logger.debug("Got group: " + group.groupId + ", organisation: " + group.organisationId);

        const now = new Date();
        const dateString = now.getFullYear() + '-' + ('0' + (now.getMonth() + 1)).slice(-2) + '-' + ('0' + now.getDate()).slice(-2);
        const url = `${KompassiService._kompassiApiUrl}/activities/findByOrganisation?organisationId=${group.organisationId}&startAt=${dateString}`;
        const headers = {
            'Content-Type': 'application/json',
            'x-api-key': KompassiService._kompassiApiKey
        };
        const request = this.httpService
            .get(url, { headers })
            .pipe(map((response) => response.data.map((data: object) => data as Activity)));
        const existingActivities: Activity[] = await lastValueFrom(request);

        const searchedActivityTitle = KompassiService.getActivityTitle(club, now);
        const matchingActivities = existingActivities.filter(a => {
            return a.groupId === club.kompassiIntegration.groupId &&
                a.activityTitle === searchedActivityTitle;
        });

        // If multiple found with the same title, use the newest.
        const maxId = Math.max(...matchingActivities.map(ma => ma.activityId)) || 0;
        return maxId === 0 ? null : matchingActivities.find(ma => ma.activityId === maxId);
    }

    private async getGroup(id: number): Promise<Group> {
        const url = `${KompassiService._kompassiApiUrl}/groups/${id}`;
        const headers = {
            'Content-Type': 'application/json',
            'x-api-key': KompassiService._kompassiApiKey
        };
        const request = this.httpService
            .get(url, { headers })
            .pipe(map((response) => response.data as Group));
        return await lastValueFrom(request);
    }

    private async createActivityForToday(club: Club): Promise<number> {
        KompassiService._logger.log("Create activity for club: " + club.name);
        const now = new Date();
        const dateString = now.getFullYear() + '-' + ('0' + (now.getMonth() + 1)).slice(-2) + '-' + ('0' + now.getDate()).slice(-2);
        const timeString = ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2) + ':00';

        const url = KompassiService._kompassiApiUrl + '/activities';
        const data = {
            groupId: club.kompassiIntegration.groupId,
            title: KompassiService.getActivityTitle(club, now),
            startAt: `${dateString} ${timeString}`,
            endAt: `${dateString} 23:00:00`,
            activityTypeIds: KompassiService.parseActivityTypeIds(club)
        };
        const headers = {
            'Content-Type': 'application/json',
            'x-api-key': KompassiService._kompassiApiKey
        };

        const request = this.httpService
            .post(url, data, { headers })
            .pipe(map((response) => response.data));
        const { id } = await lastValueFrom(request);

        return id;
    }

    private async checkInForActivity(body: CheckInRequestBody) {
        KompassiService._logger.log("Check-in for activity: " + body.activityId);

        const url = KompassiService._kompassiApiUrl + '/check-in';
        const headers = {
            'Content-Type': 'application/json',
            'x-api-key': KompassiService._kompassiApiKey
        };

        lastValueFrom(this.httpService.post(url, body, { headers }));
    }

    private static getGenderId(junior: Junior): number {
        const gender: Gender = junior.gender as Gender;
        const genderId = genderMapping.find(m => m.nutakortti === gender)?.kompassiGenderId ?? 0;
        if (genderId > 0) return genderId;
        throw new Error("Unknown gender.");
    }

    private static getAgeGroupId(junior: Junior): number {
        const age = calculateAge(junior.birthday);
        let ageGroupId = 0;
        statisticsAgeGroups.forEach(ag => {
            const [min, max] = ag.range.split('-');
            if (isBetween(age, +min, +max)) ageGroupId = ag.kompassiId;
        });

        if (ageGroupId > 0) return ageGroupId;
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

    private static parseActivityTypeIds(club: Club): number[] {
        const activityTypeIds = club.kompassiIntegration?.activityTypeIds?.replace(/\s/g, '').split(',').filter(v => !!v).map(Number);
        return activityTypeIds ? activityTypeIds : [];
    }
}
