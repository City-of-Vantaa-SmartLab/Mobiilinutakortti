import { Logger } from '@nestjs/common';
import { SecurityContextDto } from '../authentication/dto';
import { obfuscate } from '../common/helpers';

const logger = new Logger('Junior Service Helper');

export function formatName(firstName: string, lastName: string, nickName: string): string {
    let formattedName = `${firstName} `;
    if (nickName && nickName.trim() !== '') { formattedName += `'${nickName}' `; }
    return formattedName += lastName;
}

export function validateParentData(parentsName: string, securityContext: SecurityContextDto): boolean {
    const expected = `${securityContext.firstName} ${securityContext.lastName}`;
    if (parentsName !== expected) {
        logger.warn(`Invalid parent data: expected ${obfuscate(expected)}, got ${obfuscate(parentsName)}`)
    }

    return parentsName === expected;
}
