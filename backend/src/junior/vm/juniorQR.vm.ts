import { Junior } from '../entities';
import { formatName } from '../junior.helper';

export class JuniorQRViewModel {
    id: string;
    name: string;

    constructor(junior: Junior) {
        this.id = junior.id;
        this.name = formatName(junior.firstName, junior.lastName, junior.nickName);
    }
}
