import { Junior } from '../entities';

export class JuniorQRViewModel {
    id: string;
    name: string | null;
    status: string;

    constructor(junior: Junior) {
        this.id = junior.id;
        this.name = null; // NOTE: for security reasons, name is hidden. Could be: junior.nickName ?? junior.firstName;
        this.status = junior.status;
    }
}
