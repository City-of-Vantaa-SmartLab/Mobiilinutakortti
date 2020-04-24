export const datesDifferLessThan = (d1: Date, d2: Date, maxDiff: number): boolean => {
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate() &&
        Math.abs(d1.getHours() - d2.getHours()) < maxDiff
    );
};
