import * as content from '../../content.json';

export class CheckInResponseViewModel {
    success: boolean;
    message: string;

    constructor(success: boolean, clubName?: string) {
        this.success = success;
        success ? this.message = `${content.CheckInSuccess} ${clubName}!` : this.message = content.NoNewCheckins;
    }
}
