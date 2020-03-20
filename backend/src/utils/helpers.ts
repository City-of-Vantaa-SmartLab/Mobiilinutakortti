export const datesMatchOnHourlyLevel = (d1: Date, d2: Date): boolean => {
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDay() === d2.getDay() &&
        d1.getHours() === d2.getHours()
    );
};
