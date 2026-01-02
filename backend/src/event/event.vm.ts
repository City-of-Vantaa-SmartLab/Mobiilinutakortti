import { Event } from './event.entity';
import { KompassiIntegration } from '../kompassi/kompassiIntegration.entity';

export class EventViewModel {
    id: number;
    name: string;
    description: string;
    startDate: Date;
    kompassiIntegration: KompassiIntegration;

    constructor(event: Event) {
        this.id = event.id;
        this.name = event.name;
        this.description = event.description;
        this.startDate = event.startDate;
        this.kompassiIntegration = event.kompassiIntegration;
    }
}
