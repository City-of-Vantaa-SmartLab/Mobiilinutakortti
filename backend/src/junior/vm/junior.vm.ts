import { Junior } from '../entities';

export class JuniorUserViewModel {
    id: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
    postCode: string;
    parentsName: string;
    parentsPhoneNumber: string;
    gender: string;
    birthdayTimestamp: string;
    homeYouthClub: string;

    constructor(entity: Junior) {
        this.id = entity.id;
        this.phoneNumber = entity.phoneNumber;
        this.firstName = entity.firstName;
        this.lastName = entity.lastName;
        this.parentsName = entity.parentsName;
        this.postCode = entity.postCode;
        this.parentsPhoneNumber = entity.parentsPhoneNumber;
        this.gender = entity.gender;
        this.homeYouthClub = entity.homeYouthClub;
        this.birthdayTimestamp = entity.birthdayTimestamp;
    }
}
