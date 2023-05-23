import { YouthWorker } from '../entities';

/**
 * The model returned to the frontend for youth workers.
 */
export class YouthWorkerUserViewModel {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isAdmin: boolean;
    mainYouthClub: string;
    passwordLastChanged: Date;

    /**
     * @param entity - the youth worker to convert to a VM.
     */
    constructor(entity: YouthWorker) {
        this.id = entity.id;
        this.email = entity.email;
        this.firstName = entity.firstName;
        this.lastName = entity.lastName;
        this.isAdmin = entity.isAdmin;
        this.mainYouthClub = entity.mainYouthClub;
        this.passwordLastChanged = entity.passwordLastChanged;
    }
}
