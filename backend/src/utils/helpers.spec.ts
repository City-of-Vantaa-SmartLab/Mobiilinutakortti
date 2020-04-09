import { datesDifferLessThan } from './helpers';

describe('Helpers', () => {
    describe('dateDiffersLessThan', () => {
        it('should return false when dates differ more than given amount`', () => {
            const date1 = new Date();
            const date2 = new Date();
            date2.setHours(date1.getHours() + 3);
            expect(datesDifferLessThan(date1, date2, 2)).toBeFalsy();
        });
        it('should return true when dates differ less than given amount`', () => {
            const date1 = new Date();
            const date2 = new Date();
            date2.setHours(date1.getHours() + 1);
            expect(datesDifferLessThan(date1, date2, 2)).toBeTruthy();
        });
    });
});
