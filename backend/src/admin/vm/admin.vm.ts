import { Admin } from '../admin.entity';

export class AdminUserViewModel {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isSuperUser: boolean;

    constructor(entity: Admin) {
        this.id = entity.id;
        this.email = entity.email;
        this.firstName = entity.firstName;
        this.lastName = entity.lastName;
        this.isSuperUser = entity.isSuperUser;
    }
}
