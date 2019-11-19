import { ValueTransformer } from 'typeorm';
import { sanitisePhoneNumber } from '../junior/junior.utility';

export const lowercase: ValueTransformer = {
    to: (str: string) => str.toLocaleLowerCase(),
    from: (str: string) => str,
};

export const jsonDataToBoolean: ValueTransformer = {
    to: (str: string | boolean) => typeof str === 'string' ? str.toLocaleLowerCase() === 'true' : str,
    from: (bool: boolean) => bool,
};

export const jsonDataToNumber: ValueTransformer = {
    to: (str: string | number) => typeof str === 'string' ? +str : str,
    from: (num: number) => num,
};

/**
 * A transformer to be used on databases so that all numbers are stored in an international format.
 */
export const makePhoneNumberInternational: ValueTransformer = {
    to: (str: string) => {
        const sanitisedPhoneNumber = sanitisePhoneNumber(str);
        return sanitisedPhoneNumber.charAt(0) === '0' ? sanitisedPhoneNumber.replace('0', '358') : sanitisedPhoneNumber;
    },
    from: (str: string) => str,
};


