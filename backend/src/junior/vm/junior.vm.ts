import { Junior } from '../junior.entity';

export class JuniorUserViewModel {
    id: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;

    constructor(entity: Junior) {
        this.id = entity.id;
        this.phoneNumber = entity.phoneNumber;
        this.firstName = entity.firstName;
        this.lastName = entity.lastName;
    }
}
