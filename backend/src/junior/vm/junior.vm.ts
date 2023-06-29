import { Junior } from '../entities';
import { STATUS } from '../enum/status.enum';
import { formatName } from '../junior.helper';

export class JuniorUserViewModel {
    id: string;
    phoneNumber: string;
    smsPermissionJunior: boolean;
    displayName: string;
    firstName: string;
    lastName: string;
    nickName: string;
    postCode: string;
    school: string;
    class: string;
    parentsName: string;
    parentsPhoneNumber: string;
    smsPermissionParent: boolean;
    parentsEmail: string;
    emailPermissionParent: boolean;
    additionalContactInformation: string;
    gender: string;
    birthday: string;
    creationDate: string;
    homeYouthClub: string;
    communicationsLanguage: string;
    status: STATUS;
    photoPermission: boolean;

    constructor(entity: Junior) {
        this.id = entity.id;
        this.firstName = entity.firstName;
        this.lastName = entity.lastName;
        this.nickName = entity.nickName;
        this.phoneNumber = entity.phoneNumber;
        this.smsPermissionJunior = entity.smsPermissionJunior;
        this.parentsName = entity.parentsName;
        this.school = entity.school;
        this.class = entity.class;
        this.postCode = entity.postCode;
        this.parentsPhoneNumber = entity.parentsPhoneNumber;
        this.smsPermissionParent = entity.smsPermissionParent;
        this.parentsEmail = entity.parentsEmail;
        this.emailPermissionParent = entity.emailPermissionParent;
        this.additionalContactInformation = entity.additionalContactInformation;
        this.gender = entity.gender;
        this.homeYouthClub = entity.homeYouthClub;
        this.communicationsLanguage = entity.communicationsLanguage;
        this.birthday = entity.birthday;
        this.displayName = formatName(entity.firstName, entity.lastName, entity.nickName);
        this.creationDate = entity.creationDate;
        this.status = entity.status;
        this.photoPermission = entity.photoPermission;
    }
}
