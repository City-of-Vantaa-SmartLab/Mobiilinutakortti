
export class CheckInResponseViewModel {
    success: boolean;
    response: string = '';

    constructor(success: boolean, response?: string) {
        this.success = success;
        if (response) { this.response = response; }
    }
}
