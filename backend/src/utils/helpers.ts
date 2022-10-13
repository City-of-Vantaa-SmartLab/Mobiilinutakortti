export const obfuscate = (s: string): string => {
    return s.split(' ').map(item => {
        const first = item.slice(0, 1);
        const rest = item.slice(1).replace(/./g, '.');
        return first + rest;
    }).join(' ')
}
