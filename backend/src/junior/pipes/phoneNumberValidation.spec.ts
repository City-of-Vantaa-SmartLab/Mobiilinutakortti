import { PhoneNumberValidationPipe } from './phoneNumberValidation.pipe';
import { ResetPhoneNumberValidationPipe } from './resetPhoneNumberValidation.pipe';

const generateMockPhoneNumbers = (length: number): string[] =>
  Array.from({ length }, () => '7'.repeat(length));

describe('Phone number validation', () => {
  const validPrefixes = ['0', '358', '+358'];
  const validLengths = [6, 7, 8, 9, 10];
  const validNumbers: string[] = [].concat(
    ...validLengths.map(generateMockPhoneNumbers),
  );

  describe('PhoneNumberValidationPipe', () => {
    const validationPipe = new PhoneNumberValidationPipe();

    it('passes valid phone numbers', () => {
      for (let prefix of validPrefixes) {
        for (let validNumber of validNumbers) {
          const phoneNumber = `${prefix}${validNumber}`;
          const value = {
            phoneNumber,
            parentsPhoneNumber: phoneNumber,
          };
          expect(validationPipe.transform(value)).toBe(value);
          expect(validationPipe.transform({ userData: value })).toEqual({
            userData: value,
          });
        }
      }
    });

    it('rejects invalid phone numbers', () => {
      // Incorrect length
      expect(() =>
        validationPipe.transform({
          phoneNumber: '050777',
          parentsPhoneNumber: '358507777',
        }),
      ).toThrow('Puhelinnumero on virheellinen');
      expect(() =>
        validationPipe.transform({
          userData: {
            phoneNumber: '050777',
            parentsPhoneNumber: '358507777',
          },
        }),
      ).toThrow('Puhelinnumero on virheellinen');
      expect(() =>
        validationPipe.transform({
          phoneNumber: '+358507777',
          parentsPhoneNumber: '050777',
        }),
      ).toThrow('Huoltajan puhelinnumero on virheellinen');
      expect(() =>
        validationPipe.transform({
          userData: {
            phoneNumber: '+358507777',
            parentsPhoneNumber: '050777',
          },
        }),
      ).toThrow('Huoltajan puhelinnumero on virheellinen');
      expect(() =>
        validationPipe.transform({
          phoneNumber: '050777777777',
          parentsPhoneNumber: '358507777',
        }),
      ).toThrow('Puhelinnumero on virheellinen');
      expect(() =>
        validationPipe.transform({
          phoneNumber: '+358507777',
          parentsPhoneNumber: '050777777777',
        }),
      ).toThrow('Huoltajan puhelinnumero on virheellinen');

      // Incorrect prefix
      expect(() =>
        validationPipe.transform({
          phoneNumber: '357507777',
          parentsPhoneNumber: '0507777',
        }),
      ).toThrow('Puhelinnumero on virheellinen');
      expect(() =>
        validationPipe.transform({
          phoneNumber: '0507777',
          parentsPhoneNumber: '+359507777',
        }),
      ).toThrow('Huoltajan puhelinnumero on virheellinen');
    });
  });

  describe('ResetPhoneNumberValidationPipe', () => {
    const validationPipe = new ResetPhoneNumberValidationPipe();

    it('passes valid phone numbers', () => {
      for (let prefix of validPrefixes) {
        for (let validNumber of validNumbers) {
          const phoneNumber = `${prefix}${validNumber}`;
          const value = { phoneNumber };
          expect(validationPipe.transform(value)).toBe(value);
        }
      }
    });

    it('rejects invalid phone numbers', () => {
      // Incorrect length
      expect(() =>
        validationPipe.transform({
          phoneNumber: '050777',
        }),
      ).toThrow('Puhelinnumero on virheellinen');
      expect(() =>
        validationPipe.transform({
          phoneNumber: '050777777777',
        }),
      ).toThrow('Puhelinnumero on virheellinen');

      // Incorrect prefix
      expect(() =>
        validationPipe.transform({
          phoneNumber: '357507777',
        }),
      ).toThrow('Puhelinnumero on virheellinen');
      expect(() =>
        validationPipe.transform({
          phoneNumber: '+357507777',
        }),
      ).toThrow('Puhelinnumero on virheellinen');
    });
  });
});
