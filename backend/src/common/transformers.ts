import { ValueTransformer } from 'typeorm';

export const lowercase: ValueTransformer = {
    to: (str: string) => str.toLocaleLowerCase(),
    from: (str: string) => str
};

export const jsonDataToBoolean: ValueTransformer = {
    to: (str: string | boolean) => typeof str === 'string' ? str.toLocaleLowerCase() === 'true' : str,
    from: (bool: boolean) => bool
};

export const jsonDataToNumber: ValueTransformer = {
    to: (str: string | number) => typeof str === 'string' ? +str : str,
    from: (num: number) => num
};

export const trimString: ValueTransformer = {
    to: (str: string) => typeof str === 'string' ? str.trim() : str,
    from: (str: string) => str
};

/**
 * Make phone numbers E.164 format: leading '+' + country code + national number as digit-only. Default to Finnish country code.
 */
export const standardizePhoneNumber: ValueTransformer = {
    to: (str: string) => {
        let digitsOnly = str.replace(/[^0-9]/g, '');
        if (digitsOnly.charAt(0) === '0') digitsOnly = digitsOnly.replace('0', '358');
        return '+' + digitsOnly;
    },
    from: (str: string) => str
};
