import { ValueTransformer } from "typeorm";

export const obfuscate = (s: string): string => {
    return s.split(' ').map(item => {
        const first = item.slice(0, 1);
        const rest = item.slice(1).replace(/./g, '.');
        return first + rest;
    }).join(' ')
}

// Character varying-type saves values as strings, but they need to be fetched as numbers
export class NumberTransformer implements ValueTransformer {
  to(value: number): string {
    return value.toString();
  };

  from(value: string): number {
    return parseInt(value);
  };
};