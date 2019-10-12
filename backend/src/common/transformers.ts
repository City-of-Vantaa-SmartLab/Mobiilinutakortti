import { ValueTransformer } from 'typeorm';

export const lowercase: ValueTransformer = {
    to: (str: string) => str.toLocaleLowerCase(),
    from: (str: string) => str,
};

export const stringToBoolean: ValueTransformer = {
    to: (str: string) => str.toLocaleLowerCase() === 'true',
    from: (bool: boolean) => bool,
};
