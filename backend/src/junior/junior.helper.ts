export function formatName(firstName: string, lastName: string, nickName: string): string {
    let formattedName = `${firstName} `;
    if (nickName && nickName.trim() !== '') { formattedName += `'${nickName}' `; }
    return formattedName += lastName;
}
