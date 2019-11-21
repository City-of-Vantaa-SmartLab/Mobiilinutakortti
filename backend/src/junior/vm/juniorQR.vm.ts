import { Junior } from '../entities';

export class JuniorQRViewModel {
    id: string;
    name: string;

    constructor(junior: Junior) {
        this.id = junior.id;
        this.name = `${junior.firstName} '${junior.nickName}' ${junior.lastName}`;
    }
}
