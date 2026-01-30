export enum failReason {
    CODE = 'CODE',
    SPAM = 'SPAM',
    PERMIT = 'PERMIT',
    NONE = ''
};

export class CheckInResponseViewModel {
    // Nick name or first name of who is checking in. Empty on failed check in attempt.
    checkInName: string;

    // Used to show the reason why check-in fails.
    // CODE = security code is wrong.
    // SPAM = user is already checked in or check-in happened too many times.
    // PERMIT = junior does not have required entry permit for the event.
    // '' = check-in was successful.
    reason: failReason = failReason.NONE;

    constructor(checkInName: string, reason?: failReason) {
        this.checkInName = checkInName;
        if (reason) this.reason = reason;
    }
}
