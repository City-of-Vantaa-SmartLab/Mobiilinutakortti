import { Club } from '../entities';

export class ClubViewModel {
    id: string;
    name: string;
    postCode: string;

    constructor(club: Club) {
        this.id = club.id;
        this.name = club.name;
        this.postCode = club.postCode;
    }
}
