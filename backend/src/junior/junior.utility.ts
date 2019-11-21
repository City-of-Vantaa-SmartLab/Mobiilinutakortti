export function sanitisePhoneNumber(phoneNumber: string): string {
    phoneNumber = phoneNumber.replace(/[^$0-9]/g, '');
    return phoneNumber;
}
