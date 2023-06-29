import { Junior } from '../entities';
import { STATUS } from '../enum/status.enum';
import { formatName } from '../junior.helper';

export class JuniorQRViewModel {
    id: string;
    name: string;
    status: STATUS;

    constructor(junior: Junior) {
        this.id = junior.id;
        this.name = formatName(junior.firstName, junior.lastName, junior.nickName);
        this.status = junior.status;
    }
}
