import { Messages } from '../classes/messages';
import { Club } from '../entities';
import { KompassiIntegration } from '../../kompassi/kompassiIntegration.entity';

export class ClubViewModel {
    id: number;
    name: string;
    postCode: string;
    active: boolean;
    messages: Messages;
    kompassiIntegration: KompassiIntegration;

    constructor(club: Club) {
        this.id = club.id;
        this.name = club.name;
        this.postCode = club.postCode;
        this.active = club.active;
        this.messages = club.messages;
        this.kompassiIntegration = club.kompassiIntegration;
    }
}
