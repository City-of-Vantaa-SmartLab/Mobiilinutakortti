import { Event } from './event.entity';

export class EventViewModel {
    id: number;
    name: string;
    description: string;
    startDate: Date;
    integrationId: number;
    hasExtraEntry: boolean;

    constructor(event: Event) {
        this.id = event.id;
        this.name = event.name;
        this.description = event.description;
        this.startDate = event.startDate;
        this.integrationId = event.integrationId;
        this.hasExtraEntry = !!event.extraEntryType;
    }
}
