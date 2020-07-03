import { SecurityContextDto } from "src/authentication/dto";

export function formatName(firstName: string, lastName: string, nickName: string): string {
    let formattedName = `${firstName} `;
    if (nickName && nickName.trim() !== '') { formattedName += `'${nickName}' `; }
    return formattedName += lastName;
}

export function validateParentData(parentsName: string, securityContext: SecurityContextDto): boolean {
    return parentsName === `${securityContext.firstName} ${securityContext.lastName}`
}