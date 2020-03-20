export const datesDifferLessThan = (d1: Date, d2: Date, maxDiff: number): boolean => {
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDay() === d2.getDay() &&
        Math.abs(d1.getHours() - d2.getHours()) < maxDiff
    );
};
