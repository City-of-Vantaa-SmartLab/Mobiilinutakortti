import { ValueTransformer } from 'typeorm';

export const lowercase: ValueTransformer = {
    to: (str: string) => str.toLocaleLowerCase(),
    from: (str: string) => str,
};

export const jsonDataToBoolean: ValueTransformer = {
    to: (str: string | boolean) => typeof str === 'string' ? str.toLocaleLowerCase() === 'true' : str,
    from: (bool: boolean) => bool,
};
