import { Junior } from '../entities';

export class JuniorQRViewModel {
    id: string;
    name: string;
    status: string;

    constructor(junior: Junior) {
        this.id = junior.id;
        this.name = junior.nickName ?? junior.firstName;
        this.status = junior.status;
    }
}
