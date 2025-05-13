export enum failReason {
    CODE = 'CODE',
    SPAM = 'SPAM',
    NONE = ''
};

export class CheckInResponseViewModel {
    success: boolean;

    // Used to show the reason why check-in fails.
    // CODE = security code is wrong.
    // SPAM = user is already checked in or check-in happened too many times.
    // '' = check-in was successful.
    reason: failReason = failReason.NONE;

    constructor(success: boolean, reason?: failReason) {
        this.success = success;
        if (reason) { this.reason = reason; }
    }
}
