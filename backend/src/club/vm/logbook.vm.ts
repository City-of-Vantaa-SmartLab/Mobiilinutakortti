export class LogBookViewModel {
    clubName: string;
    genders: KeyValuePair[];
    ages: KeyValuePair[];

    constructor(clubName: string, genders: Map<string, number>, ages: Map<string, number>) {
        this.clubName = clubName;
        this.genders = [];
        this.ages = [];
        Array.from(genders.keys()).forEach(key => {
            this.genders.push({ key, value: genders.get(key) } as KeyValuePair);
        });
        Array.from(ages.keys()).forEach(key => {
            this.ages.push({ key, value: ages.get(key) } as KeyValuePair);
        });
    }
}

interface KeyValuePair {
    key: string;
    value: number;
}
