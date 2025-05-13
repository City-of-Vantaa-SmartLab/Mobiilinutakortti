import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Club } from '../club/entities';
import { Junior } from '../junior/entities';
import { HttpService } from '@nestjs/axios';
import { map, lastValueFrom } from 'rxjs';
import { Activity, CheckInRequestBody, Group } from './classes';
import { calculateAge, isBetween } from '../common/helpers';
import statisticsAgeGroups from '../common/statisticsAgeGroups';
import genderMapping, { Gender } from '../common/genderMapping';

type KompassiActivity = {
    clubId: number,
    kompassiActivityId: number | null,
    pendingCreation: boolean
}

@Injectable()
export class KompassiService {

    private readonly kompassiApiKey = process.env.KOMPASSI_API_KEY;
    private readonly kompassiApiUrl = process.env.KOMPASSI_API_URL;
    private readonly logger = new Logger('Kompassi Service');

    // NB: as this "database" is now kept only in memory, in case of multiple instances for backend, it might not work as intended.
    // The point of this database is to keep tab on Kompassi activities ("toiminta", such as "Nuorisotilan vapaa toiminta -ilta") so that there would be:
    // * no race condition when multiple people check-in very quickly and a Kompassi activities needs to be created
    // * less API traffic to Kompassi
    // * faster overall performance and less resources used
    private readonly activities: KompassiActivity[];

    constructor(
        private readonly httpService: HttpService
    ) {
        this.activities = [];
    }

    // Clear activities every night at 4 AM.
    @Cron('0 4 * * *')
    reset(): void {
        this.activities.splice(0, this.activities.length);
        this.logger.log('Cleared activities DB.');
    }

    async updateKompassiData(junior: Junior, club: Club, numberOfRetries: number = 0) {
        if (!this.kompassiApiUrl ||
            !this.kompassiApiKey ||
            !club.kompassiIntegration?.enabled ||
            !club.kompassiIntegration?.groupId) return;

        let shouldCancelPending = false;
        try {
            let activityId: number = 0;
            const activityInDB = this.activities.find(a => a.clubId == club.id);
            if (!activityInDB) {
                // This prevents another async call from creating a new activity via API.
                this.activities.push({clubId: club.id, kompassiActivityId: null, pendingCreation: true});

                shouldCancelPending = true;
                const activityFromAPI = await this.getActivityForTodayFromAPI(club);
                activityId = activityFromAPI ? activityFromAPI.activityId : await this.createActivityForToday(club);
                this.logger.verbose(`ActivityId: ${activityId}.`);
                shouldCancelPending = false;

                // Release waiting in possible other parallel async calls.
                const pendingActivity = this.activities.find(a => a.clubId == club.id);
                pendingActivity.kompassiActivityId = activityId;
                pendingActivity.pendingCreation = false;
            } else if (activityInDB.pendingCreation) {
                // Wait for the first parallel async call to finish fetching/creating activity via API.
                // Try 6 times at max, so 6*10 seconds in total until giving up.
                // The longest delay seen when creating activity, with network and API lagging, is around 30 seconds.
                if (numberOfRetries == 6) throw new Error('Failed to find activity after waiting.');
                this.logger.verbose(`Waiting for pending activity for club ${club.id}.`);
                numberOfRetries++;
                setTimeout(() => this.updateKompassiData(junior, club, numberOfRetries), 10000);
                return;
            } else {
                if (activityInDB.kompassiActivityId == null) throw new Error('Null activity id.');
                activityId = activityInDB.kompassiActivityId;
                this.logger.debug(`Found club ${club.id} activity from in-memory DB` + ((numberOfRetries > 0) ? ` after ${numberOfRetries} retries.` : '.'));
            }

            const ageGroupId = KompassiService.getAgeGroupId(junior);
            const genderId = KompassiService.getGenderId(junior);
            await this.checkInForActivity({ activityId, ageGroupId, genderId });
        } catch (e) {
            this.logger.error('Error during Kompassi integration: ' + e);

            // If there was an error creating an activity, remove the pending one so that later requests aren't blocked.
            if (shouldCancelPending) {
                const removeIndex = this.activities.findIndex(a => a.clubId == club.id && a.pendingCreation);
                if (removeIndex > -1) this.activities.splice(removeIndex, 1);
            }
        }
    }

    private async getActivityForTodayFromAPI(club: Club): Promise<Activity> {
        this.logger.debug('Get activity for club: ' + club.name);

        // Get the group to get the organisation id to get the activities.
        // NB: this could be optimized by caching the organisation id if speed seems sluggish in practice.
        const group = await this.getGroup(club.kompassiIntegration.groupId);
        this.logger.debug('Got group: ' + group.groupId + ', organisation: ' + group.organisationId);

        const now = new Date();
        const dateString = now.getFullYear() + '-' + ('0' + (now.getMonth() + 1)).slice(-2) + '-' + ('0' + now.getDate()).slice(-2);
        const url = `${this.kompassiApiUrl}/activities/findByOrganisation?organisationId=${group.organisationId}&startAt=${dateString}`;
        const headers = {
            'Content-Type': 'application/json',
            'x-api-key': this.kompassiApiKey
        };
        const request = this.httpService
            .get(url, { headers })
            .pipe(map((response) => response.data.map((data: object) => data as Activity)));
        const existingActivities: Activity[] = await lastValueFrom(request);

        const searchedActivityTitle = KompassiService.getActivityTitle(club, now);
        const matchingActivities = existingActivities.filter(a => {
            return a.groupId === club.kompassiIntegration.groupId &&
                a.activityTitle === searchedActivityTitle &&
                a.activityStatus === "Active" // Ignores "Archived" (deleted) activities.
        });

        // If multiple found with the same title, use the newest.
        const maxId = Math.max(...matchingActivities.map(ma => ma.activityId)) || 0;
        return maxId === 0 ? null : matchingActivities.find(ma => ma.activityId === maxId);
    }

    private async getGroup(id: number): Promise<Group> {
        const url = `${this.kompassiApiUrl}/groups/${id}`;
        const headers = {
            'Content-Type': 'application/json',
            'x-api-key': this.kompassiApiKey
        };
        const request = this.httpService
            .get(url, { headers })
            .pipe(map((response) => response.data as Group));
        return await lastValueFrom(request);
    }

    private async createActivityForToday(club: Club): Promise<number> {
        this.logger.log(`Create activity for club ${club.id} (${club.name})`);
        const now = new Date();
        const dateString = now.getFullYear() + '-' + ('0' + (now.getMonth() + 1)).slice(-2) + '-' + ('0' + now.getDate()).slice(-2);

        // Opening hours:
        // Mon-Thu 14:00-20:30
        // Fri-Sat 15:00-22:00
        const isWeekend = now.getDay() >= 5; // 5 == Friday, 6 == Saturday (week starts from Sunday at 0)
        const startTime = isWeekend ? '15:00:00' : '14:00:00';
        const endTime = isWeekend ? '22:00:00' : '20:30:00';

        const url = this.kompassiApiUrl + '/activities';
        const mandatoryData = {
            groupId: club.kompassiIntegration.groupId,
            title: KompassiService.getActivityTitle(club, now),
            startAt: `${dateString} ${startTime}`,
            endAt: `${dateString} ${endTime}`
        };

        // The activityTypeIds must be non-empty, non-null if it exists.
        const optionalData = { activityTypeIds: KompassiService.parseActivityTypeIds(club) };
        const data = optionalData.activityTypeIds.length > 0 ?
            { ...mandatoryData, ...optionalData } : mandatoryData;

        const headers = {
            'Content-Type': 'application/json',
            'x-api-key': this.kompassiApiKey
        };

        const request = this.httpService
            .post(url, data, { headers })
            .pipe(map((response) => response.data));
        const { id } = await lastValueFrom(request);

        return id;
    }

    private async checkInForActivity(body: CheckInRequestBody) {
        this.logger.log('Check-in for activity: ' + body.activityId);

        const url = this.kompassiApiUrl + '/check-in';
        const headers = {
            'Content-Type': 'application/json',
            'x-api-key': this.kompassiApiKey
        };

        const request = this.httpService.post(url, body, { headers });
        return lastValueFrom(request);
    }

    private static getGenderId(junior: Junior): number {
        const gender: Gender = junior.gender as Gender;
        const genderId = genderMapping.find(m => m.nutakortti === gender)?.kompassiGenderId ?? 0;
        if (genderId > 0) return genderId;
        throw new Error('Unknown gender.');
    }

    private static getAgeGroupId(junior: Junior): number {
        const age = calculateAge(junior.birthday);
        let ageGroupId = 0;
        statisticsAgeGroups.forEach(ag => {
            const [min, max] = ag.range.split('-');
            if (isBetween(age, +min, +max)) ageGroupId = ag.kompassiId;
        });

        if (ageGroupId > 0) return ageGroupId;
        throw new Error('Invalid age: ' + age);
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
